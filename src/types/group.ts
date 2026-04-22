export interface Group {
  id: number;
  name: string;
  grade: string | null;
  school_name: string | null;
  created_at: string;
  student_count: number;
  start_date: string | null;
  end_date: string | null;
}

export interface NewGroupInput {
  name: string;
  grade: string;
  school_name: string;
  start_date: string;
  end_date: string;
}
