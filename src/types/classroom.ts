export interface Classroom {
  id: number;
  name: string;
  subject: string | null;
  grade: string | null;
  created_at: string;
}

export interface NewClassroomInput {
  name: string;
  subject: string;
  grade: string;
}
