import { useState, useEffect, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import type { Group, NewGroupInput } from "../types/group";

const DB_URL = "sqlite:tizara.db";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const db = await Database.load(DB_URL);
      const rows = await db.select<Group[]>(
        `SELECT c.id, c.name, c.subject, c.grade, c.created_at,
                COUNT(s.id) AS student_count
         FROM groups c
         LEFT JOIN students s ON s.group_id = c.id AND s.is_deleted = 0
         WHERE c.is_deleted = 0
         GROUP BY c.id
         ORDER BY c.created_at DESC`
      );
      setGroups(rows);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const addGroup = useCallback(
    async (input: NewGroupInput) => {
      const db = await Database.load(DB_URL);
      await db.execute(
        "INSERT INTO groups (name, subject, grade) VALUES (?, ?, ?)",
        [input.name, input.subject || null, input.grade || null]
      );
      await fetchGroups();
    },
    [fetchGroups]
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, addGroup };
}
