"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight, IconEye, IconEyeOff, IconQr } from "@/components/Icons";

export function LoginForm() {
  const router = useRouter();
  const [nisn, setNisn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
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
    <div className="card-surface p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Masuk ke form</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Gunakan NISN dan password pada kartu kunjungan industrimu.
        </p>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-brand-100 bg-brand-25 p-3 text-xs leading-relaxed text-brand-800">
          <IconQr className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Punya kartu? Scan QR di kartu untuk login otomatis tanpa mengetik.
          </span>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-error-500 text-[10px] font-bold text-white">
            !
          </span>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="nisn" className="form-label">
            NISN
          </label>
          <input
            id="nisn"
            name="nisn"
            className="form-input font-mono tracking-[0.08em]"
            inputMode="numeric"
            autoComplete="username"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="0061234501"
            required
            value={nisn}
            onChange={(event) => setNisn(event.target.value.replace(/\D/g, ""))}
          />
          <p className="form-hint">10 digit angka, tertera di kartu.</p>
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-input pr-12 font-mono text-base tracking-[0.3em]"
              inputMode="numeric"
              autoComplete="current-password"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value.replace(/\D/g, ""))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-inset"
            >
              {showPassword ? (
                <IconEyeOff className="h-[18px] w-[18px]" />
              ) : (
                <IconEye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          <p className="form-hint">6 digit angka pada kartu kunjungan.</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Memeriksa data..." : "Masuk"}
          {!loading ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-xs leading-relaxed text-gray-500">
        <span className="font-semibold text-gray-600">Data contoh:</span> NISN{" "}
        <span className="font-mono">0061234501</span> · password{" "}
        <span className="font-mono">482913</span>
      </div>
    </div>
  );
}
