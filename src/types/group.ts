export interface Group {
  id: number;
  name: string;
  subject: string | null;
  grade: string | null;
  created_at: string;
  student_count: number;
}

export interface NewGroupInput {
  name: string;
  subject: string;
  grade: string;
}
