import { useState, useEffect, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import type { Student, NewStudentInput } from "../types/student";

const DB_URL = "sqlite:tizara.db";

export function useStudents(classroomId: number) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const db = await Database.load(DB_URL);
      const rows = await db.select<Student[]>(
        "SELECT id, classroom_id, name, created_at FROM students WHERE classroom_id = ? ORDER BY name ASC",
        [classroomId]
      );
      setStudents(rows);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  const addStudent = useCallback(
    async (input: NewStudentInput) => {
      const db = await Database.load(DB_URL);
      await db.execute(
        "INSERT INTO students (classroom_id, name) VALUES (?, ?)",
        [classroomId, input.name]
      );
      await fetchStudents();
    },
    [classroomId, fetchStudents]
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, addStudent };
}
