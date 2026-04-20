export interface FamilyMember {
  id: number;
  student_id: number;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface NewFamilyMemberInput {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}
