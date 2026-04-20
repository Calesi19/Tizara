export interface Visitation {
  id: number;
  student_id: number;
  contact_id: number;
  contact_name: string;
  notes: string | null;
  visited_at: string;
  created_at: string;
}

export interface NewVisitationInput {
  contact_id: number | null;
  visitor_name: string;
  notes: string;
  visited_at: string;
}
