"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight, IconEye, IconEyeOff } from "@/components/Icons";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="admin-email" className="form-label">
            Email panitia
          </label>
          <input
            id="admin-email"
            type="email"
            className="form-input"
            autoComplete="username"
            placeholder="admin@ki2026.sch.id"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              className="form-input pr-12"
              autoComplete="current-password"
              placeholder="Masukkan password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Memeriksa akun..." : "Masuk ke dashboard"}
          {!loading ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
        <span className="font-semibold text-gray-600">Akun demo:</span>{" "}
        <span className="font-mono">admin@ki2026.sch.id</span> · password{" "}
        <span className="font-mono">admin123</span>
      </div>
    </>
  );
}
