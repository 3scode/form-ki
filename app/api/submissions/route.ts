import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/session";
import { submitWorksheet } from "@/lib/store";

const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\//;

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi berakhir. Silakan login ulang." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const photoUrl = String(body?.photo_url ?? "").trim();
  const answerHistory = String(body?.answer_history ?? "").trim();
  const answerBenefit = String(body?.answer_benefit ?? "").trim();
  const answerResult = String(body?.answer_result ?? "").trim();

  if (!photoUrl) {
    return NextResponse.json({ error: "Foto diri wajib diunggah." }, { status: 400 });
  }
  const isLegacyPhoto = photoUrl.startsWith("/uploads/") || photoUrl.startsWith("/seed/");
  if (!CLOUDINARY_URL.test(photoUrl) && !isLegacyPhoto) {
    return NextResponse.json({ error: "URL foto tidak valid." }, { status: 400 });
  }
  if (!answerHistory || !answerBenefit || !answerResult) {
    return NextResponse.json({ error: "Semua pertanyaan wajib dijawab." }, { status: 400 });
  }

  try {
    const result = await submitWorksheet(session.id, {
      photo_url: photoUrl,
      answer_history: answerHistory,
      answer_benefit: answerBenefit,
      answer_result: answerResult,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  } catch (error) {
    console.error("Gagal menyimpan lembar kerja:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan lembar kerja ke database. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, redirect: "/form" });
}
