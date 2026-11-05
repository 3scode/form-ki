import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "./store";
import type { Student } from "./types";

const SECRET = process.env.SESSION_SECRET ?? "ki-2026-development-secret";
const MAX_AGE = 60 * 60 * 12;

export const STUDENT_COOKIE = "ki_student";
export const ADMIN_COOKIE = "ki_admin";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@ki2026.sch.id";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export type SessionPayload = {
  sub: string;
  role: "student" | "admin";
};

export function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verify(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload || typeof payload.sub !== "string") return null;
    if (payload.role !== "student" && payload.role !== "admin") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function cookieOptions(name: string, value: string) {
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function getStudentSession(): Promise<Student | null> {
  const store = await cookies();
  const payload = verify(store.get(STUDENT_COOKIE)?.value);
  if (!payload || payload.role !== "student") return null;
  const db = await readDb();
  return db.students.find((student) => student.id === payload.sub) ?? null;
}

export async function requireStudent(): Promise<Student> {
  const student = await getStudentSession();
  if (!student) redirect("/login");
  return student;
}

export type AdminSession = { email: string };

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const payload = verify(store.get(ADMIN_COOKIE)?.value);
  if (!payload || payload.role !== "admin") return null;
  return { email: payload.sub };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
