import { NextResponse } from "next/server";
import { normalizeMajor, parseRoster, type ParsedRoster } from "@/lib/roster";
import { getAdminSession } from "@/lib/session";
import { importStudents, type RosterImportRow } from "@/lib/store";
import type { Major } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Tidak memiliki akses admin." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File belum dipilih." }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
    return NextResponse.json(
      { error: "Format file harus .xlsx atau .xls." },
      { status: 400 },
    );
  }

  let parsed: ParsedRoster;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    parsed = parseRoster(buffer, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membaca file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const errors: string[] = [];
  const seen = new Set<string>();
  const valid: Array<{ nisn: string; name: string; className: string; major: Major }> = [];
  let skipped = 0;

  for (const [index, row] of parsed.rows.entries()) {
    const line = index + 2;
    const nisn = row.nisn.trim();
    const name = row.name.trim();
    const className = row.className.trim();
    const major = normalizeMajor(row.major);

    if (!/^\d{10}$/.test(nisn)) {
      skipped += 1;
      if (errors.length < 8) errors.push(`Baris ${line}: NISN "${row.nisn}" harus 10 digit angka.`);
      continue;
    }
    if (seen.has(nisn)) {
      skipped += 1;
      if (errors.length < 8) errors.push(`Baris ${line}: NISN ${nisn} duplikat di dalam file.`);
      continue;
    }
    if (!name || !className) {
      skipped += 1;
      if (errors.length < 8) errors.push(`Baris ${line}: Nama dan Kelas wajib diisi.`);
      continue;
    }
    if (!major) {
      skipped += 1;
      if (errors.length < 8) {
        errors.push(`Baris ${line}: Jurusan "${row.major}" tidak dikenali (TKR/TPL/TSM/TKJ/TEI/FKK).`);
      }
      continue;
    }

    seen.add(nisn);
    valid.push({ nisn, name, className, major });
  }

  if (valid.length === 0) {
    return NextResponse.json(
      {
        error: "Tidak ada baris valid untuk diimpor.",
        details: errors,
      },
      { status: 400 },
    );
  }

  let result: { inserted: number; updated: number };
  try {
    result = await importStudents(valid);
  } catch (error) {
    console.error("Import siswa gagal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database. Periksa koneksi Supabase lalu coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    sheet: parsed.sheetName,
    inserted: result.inserted,
    updated: result.updated,
    skipped,
    total: parsed.rows.length,
    details: errors,
  });
}
