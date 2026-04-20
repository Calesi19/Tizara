export interface Student {
  id: number;
  classroom_id: number;
  name: string;
  gender: string | null;
  birthdate: string | null;
  student_number: string | null;
  enrollment_date: string | null;
  created_at: string;
}

export interface NewStudentInput {
  name: string;
  gender: string;
  birthdate: string;
  student_number: string;
  enrollment_date: string;
}
