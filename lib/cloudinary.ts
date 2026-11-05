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
