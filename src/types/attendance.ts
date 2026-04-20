export type AttendanceStatus = "present" | "absent" | "late" | "early_pickup";
export type DayAttendanceStatus = "present" | "absent" | "late" | "early_pickup" | "late_arrival";

export interface AttendanceRecord {
  id: number;
  schedule_period_id: number;
  student_id: number;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
}

export interface StudentDayStatus {
  student_id: number;
  student_name: string;
  status: DayAttendanceStatus;
  time?: string;
}
