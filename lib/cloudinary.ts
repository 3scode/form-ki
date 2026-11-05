import { v2 as cloudinary } from "cloudinary";

/**
 * Upload foto siswa ke Cloudinary lewat server (signed upload), jadi
 * CLOUDINARY_API_SECRET tidak pernah sampai ke browser.
 */
function configure(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

/**
 * Ambil public_id dari URL Cloudinary yang tersimpan di submission, mis.
 * https://res.cloudinary.com/demo/image/upload/v1712/ki-2026/foto/abc.jpg
 * → ki-2026/foto/abc. URL lokal lama (/uploads/…, /seed/…) dilewati.
 */
export function publicIdFromUrl(url: string): string | null {
  if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) return null;

  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const segments = url
    .slice(index + marker.length)
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean);

  if (segments.length > 0 && /^v\d+$/.test(segments[0])) segments.shift();
  if (segments.length === 0) return null;

  const last = segments[segments.length - 1];
  const dot = last.lastIndexOf(".");
  if (dot > 0) segments[segments.length - 1] = last.slice(0, dot);

  return segments.join("/");
}

/** Hapus beberapa aset sekaligus (maksimal 100 public_id per permintaan). */
export async function deletePhotos(urls: string[]): Promise<void> {
  const publicIds = urls
    .map((url) => publicIdFromUrl(url))
    .filter((id): id is string => Boolean(id));
  if (publicIds.length === 0) return;

  configure();

  for (let index = 0; index < publicIds.length; index += 100) {
    const batch = publicIds.slice(index, index + 100);
    await cloudinary.api.delete_resources(batch, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });
  }
}

export async function uploadPhoto(buffer: Buffer, folder = "ki-2026/foto"): Promise<string> {
  configure();

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Batasi dimensi supaya file dari HP tidak membebani halaman cetak.
        transformation: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary tidak mengembalikan URL foto."));
          return;
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}
