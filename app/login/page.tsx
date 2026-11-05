import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { IconArrowRight, IconCheckCircle, IconQr, IconSpark } from "@/components/Icons";
import { getStudentSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login Siswa" };

export default async function LoginPage() {
  const session = await getStudentSession();
  if (session) redirect("/form");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-800">
            Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
        <section className="hidden lg:block">
          <span className="badge border border-brand-200 bg-brand-50 text-brand-700">
            <IconQr className="h-3.5 w-3.5" />
            Kartu Kunjungan Industri 2026
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-gray-900">
            Satu kartu untuk masuk dan mengisi lembar kerja.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600">
            Gunakan QR Code pada kartu untuk login otomatis, atau ketik NISN dan password 6 digit
            yang tertera di kartu.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-gray-700">
            {[
              "QR Code berisi data unik milikmu",
              "Password 6 digit, tanpa huruf",
              "Form otomatis menyesuaikan jurusan",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <IconCheckCircle className="h-5 w-5 text-success-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <IconSpark className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <p className="text-xs leading-relaxed text-gray-600">
              Sudah pernah mengirim lembar kerja? Login tetap bisa untuk melihat status
              pengisianmu.
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto w-full max-w-md">
            <LoginForm />
            <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
              Kesulitan login? Hubungi panitia atau wali kelas untuk mendapatkan kartu baru.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 text-center text-sm text-gray-500 sm:px-6">
          <a
            href="https://www.3scode.my.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-900 hover:decoration-gray-500 sm:text-base"
          >
            © 2026 TrisnoSanjaya - Sistem Informasi Kunjungan Industri
          </a>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 text-xs hover:text-gray-700"
          >
            Panitia? Masuk admin <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
