import { NextResponse } from "next/server";
import { createStudent, deleteAllStudents } from "@/lib/store";
import { parseStudentInput } from "@/lib/student-input";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";
// Hapus semua data bisa menguras ratusan foto Cloudinary sekaligus.
export const maxDuration = 60;

/** Menghapus seluruh data siswa beserta submission-nya. */
export async function DELETE() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Tidak memiliki akses admin." }, { status: 401 });
  }

  try {
    const deleted = await deleteAllStudents();
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("Hapus semua siswa gagal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data siswa. Coba lagi." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Tidak memiliki akses admin." }, { status: 401 });
  }

  const parsed = parseStudentInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await createStudent(parsed.value);
    if (!result.ok) {
      return NextResponse.json(
        { error: `NISN ${parsed.value.nisn} sudah terdaftar.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, student: result.student }, { status: 201 });
  } catch (error) {
    console.error("Tambah siswa gagal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan siswa ke database. Coba lagi." },
      { status: 500 },
    );
  }
}
