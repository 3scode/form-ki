import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";
import { STUDENT_COOKIE, cookieOptions, sign } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const nisn = String(body?.nisn ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (!nisn || !password) {
    return NextResponse.json({ error: "NISN dan password wajib diisi." }, { status: 400 });
  }

  const db = await readDb();
  const student = db.students.find((item) => item.nisn === nisn);

  if (!student || student.password !== password) {
    return NextResponse.json(
      { error: "NISN atau password salah. Periksa kembali kartu kunjunganmu." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, redirect: "/form" });
  response.cookies.set(
    cookieOptions(STUDENT_COOKIE, sign({ sub: student.id, role: "student" })),
  );
  return response;
}
