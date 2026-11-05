import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/session";
import { submitWorksheet } from "@/lib/store";
import { MAX_PHOTOS } from "@/lib/types";

const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\//;

function isValidPhotoUrl(url: string): boolean {
  const isLegacyPhoto = url.startsWith("/uploads/") || url.startsWith("/seed/");
  return CLOUDINARY_URL.test(url) || isLegacyPhoto;
}

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi berakhir. Silakan login ulang." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  // Klien lama masih mengirim photo_url tunggal.
  const rawPhotos = Array.isArray(body?.photo_urls)
    ? body.photo_urls
    : body?.photo_url
      ? [body.photo_url]
      : [];
  const photoUrls = rawPhotos
    .map((url: unknown) => String(url ?? "").trim())
    .filter((url: string) => url.length > 0);
  const answerHistory = String(body?.answer_history ?? "").trim();
  const answerBenefit = String(body?.answer_benefit ?? "").trim();
  const answerResult = String(body?.answer_result ?? "").trim();

  if (photoUrls.length === 0) {
    return NextResponse.json({ error: "Foto kegiatan wajib diunggah minimal satu." }, { status: 400 });
  }
  if (photoUrls.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Foto kegiatan maksimal ${MAX_PHOTOS} file.` },
      { status: 400 },
    );
  }
  if (!photoUrls.every(isValidPhotoUrl)) {
    return NextResponse.json({ error: "URL foto tidak valid." }, { status: 400 });
  }
  if (!answerHistory || !answerBenefit || !answerResult) {
    return NextResponse.json({ error: "Semua pertanyaan wajib dijawab." }, { status: 400 });
  }

  try {
    const result = await submitWorksheet(session.id, {
      photo_urls: photoUrls,
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
