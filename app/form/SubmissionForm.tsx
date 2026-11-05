"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconCamera, IconCheckCircle, IconClose, IconUpload } from "@/components/Icons";
import { getMajorLabel, MAX_PHOTOS, type Major } from "@/lib/types";

type Props = {
  name: string;
  nisn: string;
  className: string;
  major: Major;
  historyQuestion: string;
  historyTopic: string;
};

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type PickedPhoto = { id: string; file: File; preview: string };

export function SubmissionForm({
  name,
  nisn,
  className,
  major,
  historyQuestion,
  historyTopic,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [history, setHistory] = useState("");
  const [benefit, setBenefit] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "upload" | "save">("idle");
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    const previews = previewsRef.current;
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const filledCount = [photos.length > 0, history.trim(), benefit.trim(), result.trim()].filter(
    Boolean,
  ).length;
  const percent = Math.round((filledCount / 4) * 100);
  const busy = stage !== "idle";

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // Reset supaya file yang sama bisa dipilih lagi setelah dihapus.
    event.target.value = "";
    if (files.length === 0) return;

    const slots = MAX_PHOTOS - photos.length;
    const accepted: PickedPhoto[] = [];
    let message: string | null = null;

    for (const file of files) {
      if (accepted.length >= slots) break;
      if (!ALLOWED_TYPES.includes(file.type)) {
        message ??= `${file.name}: format harus JPG, PNG, atau WEBP.`;
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        message ??= `${file.name}: ukuran maksimal 8 MB. Kompres dulu lalu coba lagi.`;
        continue;
      }

      const preview = URL.createObjectURL(file);
      previewsRef.current.push(preview);
      accepted.push({ id: crypto.randomUUID(), file, preview });
    }

    if (files.length > slots) {
      message ??= `Foto kegiatan maksimal ${MAX_PHOTOS} file.`;
    }

    setError(message);
    if (accepted.length > 0) setPhotos((current) => [...current, ...accepted]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
        previewsRef.current = previewsRef.current.filter((url) => url !== target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (photos.length === 0) {
      setError("Unggah minimal satu foto kegiatan terlebih dahulu.");
      return;
    }
    if (!history.trim() || !benefit.trim() || !result.trim()) {
      setError("Semua pertanyaan wajib dijawab sebelum mengirim lembar kerja.");
      return;
    }

    try {
      setStage("upload");
      setUploadProgress({ done: 0, total: photos.length });
      const photoUrls: string[] = [];

      for (const [index, item] of photos.entries()) {
        setUploadProgress({ done: index, total: photos.length });
        const formData = new FormData();
        formData.append("file", item.file);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          setError(uploadData.error ?? "Gagal mengunggah foto. Coba lagi.");
          setStage("idle");
          setUploadProgress(null);
          return;
        }
        photoUrls.push(uploadData.url);
      }

      setStage("save");
      setUploadProgress(null);
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_urls: photoUrls,
          answer_history: history.trim(),
          answer_benefit: benefit.trim(),
          answer_result: result.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal mengirim lembar kerja. Coba lagi.");
        setStage("idle");
        return;
      }

      router.replace("/form");
      router.refresh();
    } catch {
      setError("Koneksi terputus saat mengirim. Periksa internet lalu coba lagi.");
      setStage("idle");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          Formulir siswa
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
          Lembar Kerja Kunjungan Industri 2026
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Lengkapi foto dan tiga pertanyaan di bawah. Periksa kembali sebelum mengirim — jawaban
          tidak dapat diubah setelah terkirim.
        </p>
      </div>

      <div className="card-surface p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600">Kelengkapan form</span>
          <span className="font-semibold text-brand-600">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-3 grid gap-2 text-[11px] text-gray-500 sm:grid-cols-2">
          {[
            [`Foto kegiatan (${photos.length})`, photos.length > 0],
            [`Sejarah ${historyTopic}`, Boolean(history.trim())],
            ["Manfaat kunjungan", Boolean(benefit.trim())],
            ["Hasil kunjungan", Boolean(result.trim())],
          ].map(([label, done]) => (
            <span key={String(label)} className="inline-flex items-center gap-1.5">
              <span
                className={`grid h-3.5 w-3.5 place-items-center rounded-full ${
                  done ? "bg-success-500 text-white" : "border border-gray-300 bg-white"
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="m2.5 6.2 2.2 2.2 4.6-4.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="card-surface grid grid-cols-2 gap-x-4 gap-y-3 p-5 text-sm">
        {[
          ["Nama", name],
          ["NISN", nisn],
          ["Kelas", className],
          ["Jurusan", getMajorLabel(major)],
        ].map(([label, value]) => (
          <div key={label} className={label === "Nama" ? "col-span-2 sm:col-span-1" : ""}>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-0.5 truncate font-medium text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-600">
              1
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Foto kegiatan kunjungan</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Pilih satu atau beberapa foto kegiatan. Wajahmu harus terlihat jelas di salah satu
                foto.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <input
              ref={inputRef}
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handlePhotoChange}
              disabled={busy}
            />

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-gray-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt={`Pratinjau foto kegiatan ${index + 1}`}
                      className="h-32 w-full object-cover sm:h-36"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-gray-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(item.id)}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-gray-950/70 text-white transition hover:bg-error-600"
                      disabled={busy}
                      aria-label={`Hapus foto ${index + 1}`}
                    >
                      <IconClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="flex h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-brand-300 hover:bg-brand-25 disabled:opacity-60 sm:h-36"
                  >
                    <IconCamera className="h-5 w-5 text-brand-500" />
                    <span className="text-xs font-medium text-gray-700">Tambah foto</span>
                    <span className="text-[11px] text-gray-500">
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  </button>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-brand-300 hover:bg-brand-25 disabled:opacity-60"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-500 shadow-theme-xs">
                  <IconCamera className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Ambil atau pilih foto
                </span>
                <span className="text-xs text-gray-500">
                  Bisa pilih beberapa sekaligus · JPG, PNG, atau WEBP · maks. 8 MB per foto
                </span>
              </button>
            )}

            <p className="text-[11px] text-gray-500">
              {photos.length}/{MAX_PHOTOS} foto dipilih. Foto pertama dipakai sebagai foto utama.
            </p>
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-600">
              2
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Sejarah {historyTopic}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Pertanyaan ini disesuaikan dengan jurusanmu ({getMajorLabel(major)}).
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="answer-history" className="form-label">
              {historyQuestion}
            </label>
            <textarea
              id="answer-history"
              className="form-input"
              rows={5}
              placeholder={`Ceritakan secara ringkas sejarah ${historyTopic}...`}
              value={history}
              onChange={(event) => setHistory(event.target.value)}
              disabled={busy}
              required
            />
            <p className="form-hint">{history.trim().length} karakter</p>
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-600">
              3
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Manfaat kunjungan industri</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Tuliskan manfaat yang kamu rasakan selama kegiatan.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="answer-benefit" className="form-label">
              Manfaat kegiatan kunjungan industri.
            </label>
            <textarea
              id="answer-benefit"
              className="form-input"
              rows={4}
              placeholder="Contoh: menambah wawasan tentang budaya kerja di industri..."
              value={benefit}
              onChange={(event) => setBenefit(event.target.value)}
              disabled={busy}
              required
            />
            <p className="form-hint">{benefit.trim().length} karakter</p>
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-600">
              4
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Hasil kunjungan industri</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Hal baru yang kamu dapatkan dan bisa diterapkan di sekolah.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="answer-result" className="form-label">
              Hasil dari kegiatan kunjungan industri.
            </label>
            <textarea
              id="answer-result"
              className="form-input"
              rows={4}
              placeholder="Contoh: memahami prosedur servis dan pentingnya K3..."
              value={result}
              onChange={(event) => setResult(event.target.value)}
              disabled={busy}
              required
            />
            <p className="form-hint">{result.trim().length} karakter</p>
          </div>
        </section>

        <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {stage === "upload" ? (
              `Mengunggah foto ${Math.min((uploadProgress?.done ?? 0) + 1, uploadProgress?.total ?? 1)}/${uploadProgress?.total ?? 1}...`
            ) : stage === "save" ? (
              "Menyimpan jawaban..."
            ) : (
              <>
                <IconUpload className="h-4 w-4" />
                Kirim lembar kerja
              </>
            )}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-500">
            <IconCheckCircle className="h-3.5 w-3.5 text-gray-400" />
            Pastikan data sudah benar. Jawaban tidak dapat diubah setelah dikirim.
          </p>
        </div>
      </form>
    </div>
  );
}
