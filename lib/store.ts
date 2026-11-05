import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { deletePhotos } from "./cloudinary";
import { getSupabase } from "./supabase";
import type { Database, Major, Student, Submission } from "./types";

const STUDENT_COLUMNS =
  "id, nisn, name, class, major, password, login_token, is_submitted, created_at";
const SUBMISSION_COLUMNS =
  "id, student_id, photo_url, photo_urls, answer_history, answer_benefit, answer_result, created_at";
const LEGACY_SUBMISSION_COLUMNS =
  "id, student_id, photo_url, answer_history, answer_benefit, answer_result, created_at";
const MISSING_COLUMN_NOTE =
  "Kolom submissions.photo_urls belum ada. Jalankan supabase/migration-photo-urls.sql di Supabase SQL Editor; sementara semua URL foto disimpan di kolom photo_url.";

/** Baris mentah: photo_url (kolom lama) dipakai sebagai cadangan. */
type SubmissionRow = Omit<Submission, "photo_urls"> & {
  photo_url: string | null;
  photo_urls?: string[] | null;
};

type PhotoRow = { photo_url: string | null; photo_urls?: string[] | null };

/**
 * Database yang belum menjalankan migrasi belum punya kolom photo_urls.
 * Selama itu, URL foto digabung dengan koma di photo_url supaya tidak ada foto
 * yang hilang; nilainya dipecah lagi saat dibaca.
 */
let photoUrlsColumn: boolean | null = null;

function isMissingColumn(error: { code?: string; message: string }): boolean {
  return error.code === "42703" || /column .* does not exist/i.test(error.message);
}

function splitPhotoUrl(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

type StudentRow = Omit<Student, "major"> & { major: string };

function toStudent(row: StudentRow): Student {
  return { ...row, major: row.major as Major };
}

function photoUrlsOf(row: { photo_url?: string | null; photo_urls?: string[] | null }): string[] {
  const urls = (row.photo_urls ?? []).filter(Boolean);
  if (urls.length === 0) urls.push(...splitPhotoUrl(row.photo_url));
  return urls;
}

/** Query submission dengan fallback ke kolom lama bila migrasi belum dijalankan. */
async function selectPhotoRows(studentId?: string): Promise<PhotoRow[]> {
  const supabase = getSupabase();
  const build = (columns: string) => {
    const base = supabase.from("submissions").select(columns);
    return studentId ? base.eq("student_id", studentId) : base;
  };

  if (photoUrlsColumn !== false) {
    const { data, error } = await build("photo_url, photo_urls");
    if (!error) {
      photoUrlsColumn = true;
      return (data ?? []) as unknown as PhotoRow[];
    }
    if (!isMissingColumn(error)) fail("submissions", error.message);
    photoUrlsColumn = false;
    console.warn(MISSING_COLUMN_NOTE);
  }

  const { data, error } = await build("photo_url");
  if (error) fail("submissions", error.message);
  return (data ?? []) as unknown as PhotoRow[];
}

function toSubmission(row: SubmissionRow): Submission {
  const { photo_url, photo_urls: _photoUrls, ...rest } = row;
  return { ...rest, photo_urls: photoUrlsOf(row) };
}

function fail(table: string, message: string): never {
  const hint = /schema cache|does not exist/i.test(message)
    ? " Tabel/kolom belum ada di database: jalankan supabase/schema.sql (database baru) atau supabase/migration-photo-urls.sql (database lama) di Supabase SQL Editor pada project yang sama dengan NEXT_PUBLIC_SUPABASE_URL."
    : "";
  throw new Error(`Supabase gagal mengakses tabel ${table}: ${message}.${hint}`);
}

/** Data siswa sudah terhapus, jadi kegagalan Cloudinary hanya dicatat. */
async function purgePhotoFiles(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await deletePhotos(urls);
  } catch (error) {
    console.error("Gagal menghapus foto dari Cloudinary:", error);
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export async function readDb(): Promise<Database> {
  const supabase = getSupabase();
  const [students, submissions] = await Promise.all([
    supabase.from("students").select(STUDENT_COLUMNS),
    selectPhotoRows(),
  ]);

  if (students.error) fail("students", students.error.message);

  return {
    students: ((students.data ?? []) as StudentRow[]).map(toStudent),
    submissions: (submissions as SubmissionRow[]).map(toSubmission),
  };
}

export type RosterImportRow = {
  nisn: string;
  name: string;
  className: string;
  major: Major;
};

/**
 * Insert siswa baru dan perbarui siswa lama berdasarkan NISN. Password, token
 * QR, status pengisian, dan tanggal dibuat milik siswa lama dipertahankan.
 */
export async function importStudents(
  rows: RosterImportRow[],
): Promise<{ inserted: number; updated: number }> {
  if (rows.length === 0) return { inserted: 0, updated: 0 };

  const supabase = getSupabase();

  type ExistingRow = {
    id: string;
    nisn: string;
    password: string;
    login_token: string;
    is_submitted: boolean;
    created_at: string;
  };
  const existing: ExistingRow[] = [];
  // Dipecah supaya URL PostgREST tidak kepanjangan saat import ribuan baris.
  for (const batch of chunk(rows.map((row) => row.nisn), 200)) {
    const { data, error } = await supabase
      .from("students")
      .select("id, nisn, password, login_token, is_submitted, created_at")
      .in("nisn", batch);
    if (error) fail("students", error.message);
    existing.push(...((data ?? []) as ExistingRow[]));
  }

  const byNisn = new Map(existing.map((student) => [student.nisn, student]));
  const now = new Date().toISOString();

  const payload = rows.map((row) => {
    const current = byNisn.get(row.nisn);
    if (current) {
      return {
        id: current.id,
        nisn: row.nisn,
        name: row.name,
        class: row.className,
        major: row.major,
        password: current.password,
        login_token: current.login_token,
        is_submitted: current.is_submitted,
        created_at: current.created_at,
      };
    }
    return {
      id: randomUUID(),
      nisn: row.nisn,
      name: row.name,
      class: row.className,
      major: row.major,
      password: randomInt(100000, 1000000).toString(),
      login_token: randomBytes(16).toString("hex"),
      is_submitted: false,
      created_at: now,
    };
  });

  const { error: writeError } = await supabase
    .from("students")
    .upsert(payload, { onConflict: "nisn" });
  if (writeError) fail("students", writeError.message);

  const updated = rows.filter((row) => byNisn.has(row.nisn)).length;
  return { inserted: rows.length - updated, updated };
}

export type StudentInput = {
  nisn: string;
  name: string;
  class: string;
  major: Major;
};

export type StudentMutation =
  | { ok: true; student: Student }
  | { ok: false; reason: "duplicate-nisn" | "not-found" };

/** Siswa baru dapat password 6 digit dan token QR baru; status mulai dari belum mengisi. */
export async function createStudent(input: StudentInput): Promise<StudentMutation> {
  const supabase = getSupabase();

  const { data: existing, error: readError } = await supabase
    .from("students")
    .select("id")
    .eq("nisn", input.nisn)
    .maybeSingle();
  if (readError) fail("students", readError.message);
  if (existing) return { ok: false, reason: "duplicate-nisn" };

  const { data, error } = await supabase
    .from("students")
    .insert({
      id: randomUUID(),
      nisn: input.nisn,
      name: input.name,
      class: input.class,
      major: input.major,
      password: randomInt(100000, 1000000).toString(),
      login_token: randomBytes(16).toString("hex"),
      is_submitted: false,
      created_at: new Date().toISOString(),
    })
    .select(STUDENT_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, reason: "duplicate-nisn" };
    fail("students", error.message);
  }

  return { ok: true, student: toStudent(data as StudentRow) };
}

/** Password, token QR, dan status pengisian tidak diubah lewat edit data siswa. */
export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<StudentMutation> {
  const supabase = getSupabase();

  const { data: existing, error: readError } = await supabase
    .from("students")
    .select("id")
    .eq("nisn", input.nisn)
    .neq("id", id)
    .maybeSingle();
  if (readError) fail("students", readError.message);
  if (existing) return { ok: false, reason: "duplicate-nisn" };

  const { data, error } = await supabase
    .from("students")
    .update({
      nisn: input.nisn,
      name: input.name,
      class: input.class,
      major: input.major,
    })
    .eq("id", id)
    .select(STUDENT_COLUMNS)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return { ok: false, reason: "duplicate-nisn" };
    fail("students", error.message);
  }
  if (!data) return { ok: false, reason: "not-found" };

  return { ok: true, student: toStudent(data as StudentRow) };
}

/** Mengosongkan tabel siswa; submission ikut terhapus lewat on delete cascade. */
export async function deleteAllStudents(): Promise<number> {
  const supabase = getSupabase();

  const submissions = await selectPhotoRows();

  const { data, error } = await supabase
    .from("students")
    .delete()
    .not("id", "is", null)
    .select("id");
  if (error) fail("students", error.message);

  const photoUrls = submissions.flatMap(photoUrlsOf);
  await purgePhotoFiles(photoUrls);

  return data?.length ?? 0;
}

/** Submission siswa ikut terhapus lewat on delete cascade di skema Supabase. */
export async function deleteStudent(id: string): Promise<boolean> {
  const supabase = getSupabase();

  const [submission] = await selectPhotoRows(id);

  const { data, error } = await supabase
    .from("students")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) fail("students", error.message);
  if (!data) return false;

  if (submission) await purgePhotoFiles(photoUrlsOf(submission));

  return true;
}

export type WorksheetAnswers = {
  photo_urls: string[];
  answer_history: string;
  answer_benefit: string;
  answer_result: string;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Klaim status "sudah mengisi" lebih dulu dengan update bersyarat supaya dua
 * kiriman bersamaan tidak menghasilkan dua submission.
 */
export async function submitWorksheet(
  studentId: string,
  answers: WorksheetAnswers,
): Promise<SubmitResult> {
  const supabase = getSupabase();

  const { data: claimed, error: claimError } = await supabase
    .from("students")
    .update({ is_submitted: true })
    .eq("id", studentId)
    .eq("is_submitted", false)
    .select("id")
    .maybeSingle();
  if (claimError) fail("students", claimError.message);

  if (!claimed) {
    const { data: student, error: readError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();
    if (readError) fail("students", readError.message);
    if (!student) return { ok: false, status: 401, error: "Data siswa tidak ditemukan." };
    return { ok: false, status: 409, error: "Kamu sudah mengirim lembar kerja sebelumnya." };
  }

  const insert = (withPhotoUrls: boolean) =>
    supabase.from("submissions").insert({
      id: randomUUID(),
      student_id: studentId,
      photo_url: withPhotoUrls
        ? answers.photo_urls[0]
        : answers.photo_urls.join(","),
      ...(withPhotoUrls ? { photo_urls: answers.photo_urls } : {}),
      answer_history: answers.answer_history,
      answer_benefit: answers.answer_benefit,
      answer_result: answers.answer_result,
      created_at: new Date().toISOString(),
    });

  let { error: insertError } = await insert(photoUrlsColumn !== false);
  if (insertError && isMissingColumn(insertError)) {
    photoUrlsColumn = false;
    console.warn(MISSING_COLUMN_NOTE);
    ({ error: insertError } = await insert(false));
  }

  if (insertError) {
    // Batalkan klaim supaya siswa bisa mencoba mengirim ulang.
    await supabase.from("students").update({ is_submitted: false }).eq("id", studentId);
    fail("submissions", insertError.message);
  }

  return { ok: true };
}

export function getSubmission(db: Database, studentId: string): Submission | undefined {
  return db.submissions.find((item) => item.student_id === studentId);
}

export function uniqueValues(db: Database, key: "class"): string[];
export function uniqueValues(db: Database, key: "major"): Major[];
export function uniqueValues<T extends "class" | "major">(
  db: Database,
  key: T,
): T extends "class" ? string[] : Major[] {
  return [...new Set(db.students.map((student) => student[key] as string))].sort((a, b) =>
    a.localeCompare(b, "id"),
  ) as T extends "class" ? string[] : Major[];
}
