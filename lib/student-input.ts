import type { StudentInput } from "./store";
import { MAJORS, type Major } from "./types";

export type ParsedStudent =
  | { ok: true; value: StudentInput }
  | { ok: false; error: string };

/** Validasi payload form siswa yang dipakai route tambah dan edit. */
export function parseStudentInput(body: unknown): ParsedStudent {
  const data = (body ?? {}) as Record<string, unknown>;
  const nisn = String(data.nisn ?? "").trim();
  const name = String(data.name ?? "").trim();
  const className = String(data.class ?? "").trim();
  const major = String(data.major ?? "").trim().toUpperCase();

  if (!/^\d{10}$/.test(nisn)) return { ok: false, error: "NISN harus 10 digit angka." };
  if (!name) return { ok: false, error: "Nama siswa wajib diisi." };
  if (name.length > 150) return { ok: false, error: "Nama siswa maksimal 150 karakter." };
  if (!className) return { ok: false, error: "Kelas wajib diisi." };
  if (className.length > 50) return { ok: false, error: "Kelas maksimal 50 karakter." };
  if (!MAJORS.includes(major as Major)) return { ok: false, error: "Jurusan tidak dikenali." };

  return {
    ok: true,
    value: { nisn, name, class: className, major: major as Major },
  };
}
