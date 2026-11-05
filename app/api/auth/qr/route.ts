import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";
import { STUDENT_COOKIE, cookieOptions, sign } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "").trim();

  if (!token) {
    return NextResponse.json({ error: "Token QR tidak valid." }, { status: 400 });
  }

  const db = await readDb();
  const student = db.students.find((item) => item.login_token === token);

  if (!student) {
    return NextResponse.json(
      { error: "QR Code tidak dikenali. Silakan login manual dengan NISN dan password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, redirect: "/form" });
  response.cookies.set(
    cookieOptions(STUDENT_COOKIE, sign({ sub: student.id, role: "student" })),
  );
  return response;
}
