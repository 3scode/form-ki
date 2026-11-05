import { NextResponse } from "next/server";
import { STUDENT_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: STUDENT_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
