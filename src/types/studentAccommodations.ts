export interface StudentAccommodations {
  id: number;
  student_id: number;
  desk_placement: number;
  extended_time: number;
  shorter_assignments: number;
  use_abacus: number;
  simple_instructions: number;
  visual_examples: number;
}

export interface StudentAccommodationsInput {
  desk_placement: boolean;
  extended_time: boolean;
  shorter_assignments: boolean;
  use_abacus: boolean;
  simple_instructions: boolean;
  visual_examples: boolean;
}
