import { NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/cloudinary";
import { getStudentSession } from "@/lib/session";

export const runtime = "nodejs";
// Upload foto 8 MB ke Cloudinary bisa melewati batas default function.
export const maxDuration = 30;

const MAX_SIZE = 8 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(request: Request) {
  const student = await getStudentSession();
  if (!student) {
    return NextResponse.json({ error: "Sesi berakhir. Silakan login ulang." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File foto belum dipilih." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran foto maksimal 8 MB." }, { status: 400 });
  }

  if (!EXTENSIONS[file.type]) {
    return NextResponse.json(
      { error: "Format foto harus JPG, PNG, atau WEBP." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadPhoto(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Upload Cloudinary gagal:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah foto ke Cloudinary. Coba lagi beberapa saat." },
      { status: 502 },
    );
  }
}
