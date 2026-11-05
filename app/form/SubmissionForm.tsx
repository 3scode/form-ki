"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconCamera, IconCheckCircle, IconClose, IconUpload } from "@/components/Icons";
import { getMajorLabel, type Major } from "@/lib/types";

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState("");
  const [benefit, setBenefit] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "upload" | "save">("idle");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const filledCount = [photo, history.trim(), benefit.trim(), result.trim()].filter(
    Boolean,
  ).length;
  const percent = Math.round((filledCount / 4) * 100);
  const busy = stage !== "idle";

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format foto harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError("Ukuran foto maksimal 8 MB. Kompres foto lalu coba lagi.");
      event.target.value = "";
      return;
    }

    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!photo) {
      setError("Unggah foto diri saat kunjungan terlebih dahulu.");
      return;
    }
    if (!history.trim() || !benefit.trim() || !result.trim()) {
      setError("Semua pertanyaan wajib dijawab sebelum mengirim lembar kerja.");
      return;
    }

    try {
      setStage("upload");
      const formData = new FormData();
      formData.append("file", photo);
      const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setError(uploadData.error ?? "Gagal mengunggah foto. Coba lagi.");
        setStage("idle");
        return;
      }

      setStage("save");
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_url: uploadData.url,
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
            ["Foto diri", Boolean(photo)],
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
              <h2 className="text-sm font-semibold text-gray-900">Foto diri saat kunjungan</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Ambil foto diri sendiri di lokasi kunjungan. Wajah harus terlihat jelas.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <input
              ref={inputRef}
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
              disabled={busy}
            />

            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Pratinjau foto diri"
                  className="h-60 w-full object-cover sm:h-72"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-gray-950/80 to-transparent p-3">
                  <span className="truncate text-xs font-medium text-white">
                    {photo?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-white"
                      disabled={busy}
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/40 hover:bg-white/25"
                      disabled={busy}
                      aria-label="Hapus foto"
                    >
                      <IconClose className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
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
                <span className="text-xs text-gray-500">JPG, PNG, atau WEBP · maks. 8 MB</span>
              </button>
            )}
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
              "Mengunggah foto..."
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
