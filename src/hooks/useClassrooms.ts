import { useState, useEffect, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import type { Classroom, NewClassroomInput } from "../types/classroom";

const DB_URL = "sqlite:tizara.db";

export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const db = await Database.load(DB_URL);
      const rows = await db.select<Classroom[]>(
        "SELECT id, name, subject, grade, created_at FROM classrooms ORDER BY created_at DESC"
      );
      setClassrooms(rows);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const addClassroom = useCallback(
    async (input: NewClassroomInput) => {
      const db = await Database.load(DB_URL);
      await db.execute(
        "INSERT INTO classrooms (name, subject, grade) VALUES (?, ?, ?)",
        [input.name, input.subject || null, input.grade || null]
      );
      await fetchClassrooms();
    },
    [fetchClassrooms]
  );

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  return { classrooms, loading, error, addClassroom };
}
