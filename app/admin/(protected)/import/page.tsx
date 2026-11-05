import type { Metadata } from "next";
import { IconCheckCircle, IconFile, IconSpark } from "@/components/Icons";
import { readDb, uniqueValues } from "@/lib/store";
import { ImportForm } from "./ImportForm";
import { MAJOR_LABELS, MAJORS } from "@/lib/types";

export const metadata: Metadata = { title: "Import Data Siswa" };

export default async function ImportPage() {
  const db = await readDb();
  const classes = uniqueValues(db, "class");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Import data master</h2>
        <p className="mt-1 text-sm text-gray-500">
          Unggah daftar siswa sekali, sistem membuat password dan QR Code otomatis.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <div className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <IconFile className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Upload file Excel / CSV</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Baris judul harus memuat kolom <strong>Nama</strong>, <strong>NISN</strong>,{" "}
                <strong>Kelas</strong>, dan <strong>Jurusan</strong>. NISN wajib 10 digit. Format kelas
                contoh: <strong>12-FKK-1</strong>.
              </p>
            </div>
          </div>

          <ImportForm />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <IconSpark className="h-4 w-4 text-brand-500" />
                Dibuat otomatis
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-gray-500">
                <li>· Password 6 digit angka acak</li>
                <li>· Token unik untuk QR Code</li>
                <li>· Status awal “Belum mengisi”</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <IconCheckCircle className="h-4 w-4 text-success-500" />
                NISN yang sudah ada
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-gray-500">
                <li>· Nama, kelas, dan jurusan diperbarui</li>
                <li>· Password dan QR lama tetap berlaku</li>
                <li>· Jawaban yang sudah masuk tidak dihapus</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold text-gray-900">Data saat ini</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total siswa</span>
                <span className="font-semibold text-gray-900">{db.students.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Jumlah kelas</span>
                <span className="font-semibold text-gray-900">{classes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Sudah mengisi</span>
                <span className="font-semibold text-gray-900">
                  {db.students.filter((student) => student.is_submitted).length}
                </span>
              </div>
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold text-gray-900">Jurusan yang dikenali</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MAJORS.map((major) => (
                <span key={major} className="badge bg-brand-50 text-brand-700">
                  {MAJOR_LABELS[major]}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
              Singkatan lain seperti “Teknik Komputer Jaringan” atau “TJKT” tetap dikenali dan
              dipetakan ke jurusan yang sesuai.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
