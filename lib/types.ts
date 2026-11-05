export const MAJORS = ["TKR", "TPL", "TSM", "TKJ", "TEI", "FKK"] as const;
export type Major = (typeof MAJORS)[number];

export const MAJOR_LABELS: Record<Major, string> = {
  TKR: "Teknik Kendaraan Ringan",
  TPL: "Teknik Pengelasan",
  TSM: "Teknik Sepeda Motor",
  TKJ: "Teknik Komputer dan Jaringan",
  TEI: "Teknik Elektronika Industri",
  FKK: "Farmasi Klinik dan Komunitas",
};

export function getMajorLabel(major: Major): string {
  return MAJOR_LABELS[major];
}

export type Student = {
  id: string;
  nisn: string;
  name: string;
  class: string;
  major: Major;
  password: string;
  login_token: string;
  is_submitted: boolean;
  created_at: string;
};

export type Submission = {
  id: string;
  student_id: string;
  photo_url: string;
  answer_history: string;
  answer_benefit: string;
  answer_result: string;
  created_at: string;
};

export type Database = {
  students: Student[];
  submissions: Submission[];
};

export type StudentFilter = {
  q?: string;
  status?: string;
  class?: string;
  major?: string;
};
