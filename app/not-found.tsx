import Link from "next/link";
import { Brand } from "@/components/Brand";
import { IconArrowRight, IconFile } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Brand href="/" />
        </div>
        <div className="card-surface p-6 text-center sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-gray-500">
            <IconFile className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-semibold text-gray-900">Halaman tidak ditemukan</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            QR pada lembar kerja tidak cocok dengan data siswa, atau siswa belum mengirim jawaban.
            Minta admin mencetak ulang lembarnya.
          </p>
          <Link href="/" className="btn-primary mt-6 w-full">
            Kembali ke beranda
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
