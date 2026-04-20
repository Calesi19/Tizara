export interface Note {
  id: number;
  student_id: number;
  content: string;
  created_at: string;
}

export interface NewNoteInput {
  content: string;
}
