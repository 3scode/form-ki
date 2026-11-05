import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_EMAIL, ADMIN_PASSWORD, cookieOptions, sign } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Email atau password admin salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirect: "/admin" });
  response.cookies.set(cookieOptions(ADMIN_COOKIE, sign({ sub: email, role: "admin" })));
  return response;
}
