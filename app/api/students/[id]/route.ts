import { NextResponse } from "next/server";
import { deleteStudent, updateStudent } from "@/lib/store";
import { parseStudentInput } from "@/lib/student-input";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Tidak memiliki akses admin." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = parseStudentInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await updateStudent(id, parsed.value);
    if (!result.ok) {
      if (result.reason === "duplicate-nisn") {
        return NextResponse.json(
          { error: `NISN ${parsed.value.nisn} sudah dipakai siswa lain.` },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, student: result.student });
  } catch (error) {
    console.error("Edit siswa gagal:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data siswa. Coba lagi." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Tidak memiliki akses admin." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const removed = await deleteStudent(id);
    if (!removed) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Hapus siswa gagal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus siswa. Coba lagi." },
      { status: 500 },
    );
  }
}
