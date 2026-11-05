import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { IconArrowRight, IconGrid, IconPrinter, IconQr } from "@/components/Icons";
import { getAdminSession } from "@/lib/session";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = { title: "Login Admin" };

export default async function AdminLoginPage() {
  const admin = await getAdminSession();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-stretch bg-gray-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gray-900 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_20%_0%,#252dae_0%,#101828_70%)]"
        />
        <div className="relative flex items-center gap-3 text-white">
          <img
            src="/logo.webp"
            alt="Logo SMK Muhammadiyah Kandanghaur"
            width={384}
            height={384}
            className="h-11 w-11 shrink-0 object-contain"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sistem Informasi KI</p>
            <p className="text-[11px] text-gray-300">Panel Panitia · 2026</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Kelola data, pantau progres, cetak semua kebutuhan kunjungan industri.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <IconGrid className="h-4 w-4" />
              </span>
              Data table siswa dengan filter status, kelas, dan jurusan.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <IconQr className="h-4 w-4" />
              </span>
              Kartu kredensial QR: 10 kartu per lembar A4, siap potong.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <IconPrinter className="h-4 w-4" />
              </span>
              Lembar kerja A4 lengkap dengan foto dan kolom tanda tangan.
            </li>
          </ul>
        </div>

        <p className="relative text-center">
          <a
            href="https://www.3scode.my.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-semibold text-gray-300 underline decoration-gray-600 underline-offset-4 transition-colors hover:text-white hover:decoration-gray-300"
          >
            © 2026 TrisnoSanjaya - Sistem Informasi Kunjungan Industri
          </a>
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Brand />
            <Link href="/" className="text-xs font-medium text-gray-500 hover:text-gray-800">
              Beranda
            </Link>
          </div>

          <div className="card-surface p-6 sm:p-8">
            <span className="badge border border-gray-200 bg-gray-50 text-gray-600">
              Akses panitia
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              Masuk ke dashboard
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
              Gunakan akun panitia untuk mengelola data siswa dan mencetak kredensial.
            </p>

            <AdminLoginForm />
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-gray-700">
              <IconArrowRight className="h-3.5 w-3.5 rotate-180" />
              Kembali ke beranda
            </Link>
            <Link href="/login" className="hover:text-gray-700">
              Login siswa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
