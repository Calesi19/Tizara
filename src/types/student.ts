export interface Student {
  id: number;
  classroom_id: number;
  name: string;
  created_at: string;
}

export interface NewStudentInput {
  name: string;
}
