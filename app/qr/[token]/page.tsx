import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/Brand";
import { IconArrowRight, IconQr } from "@/components/Icons";
import { readDb } from "@/lib/store";
import { QrConfirm } from "./QrConfirm";

export const metadata: Metadata = { title: "Konfirmasi QR" };

type PageProps = { params: Promise<{ token: string }> };

export default async function QrPage({ params }: PageProps) {
  const { token } = await params;
  const db = await readDb();
  const student = db.students.find((item) => item.login_token === token);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,#252dae_0%,#101828_65%)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-white">
          <BrandMark className="h-9 w-9" />
          <span className="text-sm font-semibold">Kunjungan Industri 2026</span>
        </div>

        {student ? (
          <QrConfirm
            token={token}
            name={student.name}
            className={student.class}
            major={student.major}
            nisn={student.nisn}
            alreadySubmitted={student.is_submitted}
          />
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-theme-lg sm:p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-error-50 text-error-500">
              <IconQr className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-center text-xl font-semibold text-gray-900">
              QR Code tidak dikenali
            </h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-gray-500">
              Kode pada kartu tidak cocok dengan data siswa. Kartu mungkin sudah diganti atau QR
              rusak. Silakan login manual memakai NISN dan password.
            </p>
            <Link href="/login" className="btn-primary mt-6 w-full">
              Login manual
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="mt-3 block text-center text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Kembali ke beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
