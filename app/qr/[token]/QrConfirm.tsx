"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowRight, IconCheckCircle, IconClose, IconQr, IconUser } from "@/components/Icons";
import { initials } from "@/lib/format";
import { getMajorLabel, type Major } from "@/lib/types";

type Props = {
  token: string;
  name: string;
  className: string;
  major: Major;
  nisn: string;
  alreadySubmitted: boolean;
};

export function QrConfirm({ token, name, className, major, nisn, alreadySubmitted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Konfirmasi data — KI 2026";
  }, []);

  async function handleContinue() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal memvalidasi QR. Coba lagi.");
        setLoading(false);
        return;
      }

      router.replace("/form");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi internetmu.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-lg sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
            <IconQr className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Konfirmasi data</h1>
            <p className="text-xs text-gray-500">Pemindaian kartu berhasil</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Tutup"
        >
          <IconClose className="h-4.5 w-4.5" />
        </button>
      </div>

      <p className="mt-5 text-sm text-gray-600">Apakah benar ini Anda?</p>

      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-brand-600 ring-1 ring-gray-200">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">
              {className} · {getMajorLabel(major)}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3 text-xs">
          <div>
            <dt className="text-gray-500">NISN</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-gray-800">{nisn}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="mt-0.5">
              {alreadySubmitted ? (
                <span className="badge bg-success-50 text-success-600">
                  <IconCheckCircle className="h-3.5 w-3.5" /> Sudah mengisi
                </span>
              ) : (
                <span className="badge bg-warning-50 text-warning-600">Belum mengisi</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Menyiapkan sesi..." : "Ya, lanjutkan"}
          {!loading ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="btn-outline w-full"
          disabled={loading}
        >
          Bukan saya
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-gray-500">
        <IconUser className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Jangan lanjutkan jika nama dan kelas tidak sesuai. Gunakan tombol “Bukan saya” lalu
          login manual dengan kartu milikmu.
        </span>
      </div>
    </div>
  );
}
