import { useState, useEffect, useCallback, useMemo } from "react";
import Database from "@tauri-apps/plugin-sql";
import type { SchedulePeriod } from "../types/schedule";
import type { AttendanceStatus, DayAttendanceStatus, StudentDayStatus } from "../types/attendance";

const DB_URL = "sqlite:tizara.db";

interface RawAttendanceRow {
  id: number;
  schedule_period_id: number;
  student_id: number;
  status: AttendanceStatus;
  notes: string | null;
}

function deriveDayStatus(
  sortedPeriods: SchedulePeriod[],
  studentId: number,
  records: RawAttendanceRow[]
): { status: DayAttendanceStatus; time?: string } {
  if (sortedPeriods.length === 0) return { status: "present" };

  const studentRecords = records.filter((r) => r.student_id === studentId);
  const items = sortedPeriods.map((p) => {
    const rec = studentRecords.find((r) => r.schedule_period_id === p.id);
    return { status: (rec?.status ?? "present") as AttendanceStatus, notes: rec?.notes ?? null };
  });
  const statuses = items.map((i) => i.status);

  if (statuses.some((s) => s === "early_pickup")) {
    const epItem = items.find((i) => i.status === "early_pickup");
    return { status: "early_pickup", time: epItem?.notes ?? undefined };
  }
  if (statuses.every((s) => s === "absent")) return { status: "absent" };
  if (statuses.every((s) => s === "present")) return { status: "present" };
  if (statuses[0] === "late" && statuses.slice(1).every((s) => s === "present")) {
    return { status: "late" };
  }
  const firstPresent = statuses.findIndex((s) => s === "present");
  if (
    firstPresent > 0 &&
    statuses.slice(0, firstPresent).every((s) => s === "absent") &&
    statuses.slice(firstPresent).every((s) => s === "present")
  ) {
    return { status: "late_arrival", time: items[firstPresent]?.notes ?? undefined };
  }
  return { status: "present" };
}

export function useAttendance(groupId: number, date: string) {
  const [periodsForDay, setPeriodsForDay] = useState<SchedulePeriod[]>([]);
  const [rawRecords, setRawRecords] = useState<RawAttendanceRow[]>([]);
  const [allStudents, setAllStudents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await Database.load(DB_URL);
      const dayOfWeek = new Date(date + "T12:00:00").getDay();

      const periods = await db.select<SchedulePeriod[]>(
        "SELECT id, group_id, day_of_week, name, start_time, end_time, sort_order, created_at FROM schedule_periods WHERE group_id = ? AND day_of_week = ? AND is_deleted = 0 ORDER BY sort_order ASC, start_time ASC",
        [groupId, dayOfWeek]
      );
      setPeriodsForDay(periods);

      const students = await db.select<{ id: number; name: string }[]>(
        "SELECT id, name FROM students WHERE group_id = ? AND is_deleted = 0 ORDER BY name ASC",
        [groupId]
      );
      setAllStudents(students);

      if (periods.length > 0) {
        const periodIds = periods.map((p) => p.id);
        const placeholders = periodIds.map(() => "?").join(",");
        const records = await db.select<RawAttendanceRow[]>(
          `SELECT id, schedule_period_id, student_id, status, notes FROM attendance_records WHERE schedule_period_id IN (${placeholders}) AND date = ? AND is_deleted = 0`,
          [...periodIds, date]
        );
        setRawRecords(records);
      } else {
        setRawRecords([]);
      }
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [groupId, date]);

  const dayStatuses = useMemo((): StudentDayStatus[] => {
    return allStudents.map((s) => {
      const { status, time } = deriveDayStatus(periodsForDay, s.id, rawRecords);
      return { student_id: s.id, student_name: s.name, status, time };
    });
  }, [allStudents, periodsForDay, rawRecords]);

  const upsert = useCallback(
    async (
      db: Awaited<ReturnType<typeof Database.load>>,
      studentId: number,
      periodId: number,
      status: AttendanceStatus,
      notes: string | null = null
    ) => {
      await db.execute(
        `INSERT INTO attendance_records (schedule_period_id, student_id, date, status, notes)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(schedule_period_id, student_id, date)
         DO UPDATE SET status = excluded.status, notes = excluded.notes`,
        [periodId, studentId, date, status, notes]
      );
    },
    [date]
  );

  const markPresent = useCallback(
    async (studentId: number) => {
      const db = await Database.load(DB_URL);
      await Promise.all(periodsForDay.map((p) => upsert(db, studentId, p.id, "present")));
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  const markAbsent = useCallback(
    async (studentId: number) => {
      const db = await Database.load(DB_URL);
      await Promise.all(periodsForDay.map((p) => upsert(db, studentId, p.id, "absent")));
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  const markLate = useCallback(
    async (studentId: number) => {
      const db = await Database.load(DB_URL);
      await Promise.all(
        periodsForDay.map((p, idx) => upsert(db, studentId, p.id, idx === 0 ? "late" : "present"))
      );
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  const markEarlyPickup = useCallback(
    async (studentId: number, pickupTime: string) => {
      if (periodsForDay.length === 0) return;
      const db = await Database.load(DB_URL);
      // Last period whose start_time is at or before pickupTime
      const pickupIdx = periodsForDay.reduce(
        (best, p, idx) => (p.start_time <= pickupTime ? idx : best),
        0
      );
      await Promise.all(
        periodsForDay.map((p, idx) => {
          if (idx < pickupIdx) return upsert(db, studentId, p.id, "present");
          if (idx === pickupIdx) return upsert(db, studentId, p.id, "early_pickup", pickupTime);
          return upsert(db, studentId, p.id, "absent");
        })
      );
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  const markLateArrival = useCallback(
    async (studentId: number, arrivalTime: string) => {
      if (periodsForDay.length === 0) return;
      const db = await Database.load(DB_URL);
      // First period whose end_time is after arrivalTime (the period the student arrives in)
      const arrivalIdx = periodsForDay.findIndex((p) => p.end_time > arrivalTime);
      const effectiveIdx = arrivalIdx === -1 ? periodsForDay.length : arrivalIdx;
      await Promise.all(
        periodsForDay.map((p, idx) => {
          if (idx < effectiveIdx) return upsert(db, studentId, p.id, "absent");
          return upsert(db, studentId, p.id, "present", idx === effectiveIdx ? arrivalTime : null);
        })
      );
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  const markDayStatusBulk = useCallback(
    async (studentIds: number[], status: "present" | "absent" | "late") => {
      const db = await Database.load(DB_URL);
      await Promise.all(
        studentIds.flatMap((sid) =>
          periodsForDay.map((p, idx) => {
            const s: AttendanceStatus =
              status === "late" ? (idx === 0 ? "late" : "present") : status;
            return upsert(db, sid, p.id, s);
          })
        )
      );
      await fetchData();
    },
    [periodsForDay, upsert, fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    periodsForDay,
    allStudents,
    dayStatuses,
    loading,
    error,
    markPresent,
    markAbsent,
    markLate,
    markEarlyPickup,
    markLateArrival,
    markDayStatusBulk,
  };
}
