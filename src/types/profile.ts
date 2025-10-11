// Profile-related type definitions

export interface Activity {
  name: string;
  description: string;
}

export interface APExam {
  exam: string;
  score: string;
}

export interface Award {
  name: string;
  level: string;
}

export interface ProfileData {
  gradeLevel?: string;
  demographic?: string;
  school?: string;
  gpa?: string;
  sat?: string;
  activities?: Activity[];
  apExams?: APExam[];
  awards?: Award[];
}

export interface StudentMetadata {
  name?: string;
  country?: string;
  state_province?: string;
  high_school_type?: string;
  high_school_name?: string;
  gpa_unweighted?: string;
  gpa_weighted?: string;
  test_type?: string;
  test_score?: string;
  ap_ib_hl_count?: number;
  coursework_rigor?: string;
  intended_major?: string;
  secondary_interests?: string;
  hook_context?: string;
  activities?: string;
  awards?: string;
  decisions_compact?: string;
  accept_count?: number;
  reject_count?: number;
  waitlist_count?: number;
  narrative_summary?: string;
}

export interface StudentProfile {
  name: string;
  role: string;
  blurb: string;
  avatarUrl?: string;
  metadata: StudentMetadata;
}

