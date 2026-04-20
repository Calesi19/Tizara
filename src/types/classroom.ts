export interface Classroom {
  id: number;
  name: string;
  subject: string | null;
  grade: string | null;
  created_at: string;
  student_count: number;
}

export interface NewClassroomInput {
  name: string;
  subject: string;
  grade: string;
}
