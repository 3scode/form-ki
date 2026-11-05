import type { Metadata } from "next";
import Link from "next/link";
import { IconChevronLeft, IconFile, IconPrinter } from "@/components/Icons";
import { PrintButton } from "@/components/PrintButton";
import { Worksheet } from "@/components/Worksheet";
import { WorksheetPrintStyle } from "@/components/WorksheetPrintStyle";
import { getBaseUrl } from "@/lib/base-url";
import { readDb } from "@/lib/store";

export const metadata: Metadata = { title: "Cetak Lembar Kerja" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function PrintWorksheetPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const ids = [...new Set(first(params.ids).split(",").map((id) => id.trim()).filter(Boolean))];

  const db = await readDb();
  const items = db.students
    .filter((student) => ids.includes(student.id) && student.is_submitted)
    .map((student) => ({
      student,
      submission: db.submissions.find((item) => item.student_id === student.id),
    }))
    .filter((item) => item.submission)
    .sort((a, b) => a.student.class.localeCompare(b.student.class, "id") || a.student.name.localeCompare(b.student.name, "id"));

  const baseUrl = await getBaseUrl();

  return (
    <div className="space-y-5">
      <WorksheetPrintStyle />
      <div className="no-print flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
            Kembali ke dashboard
          </Link>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-900">
            Cetak lembar kerja
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} siswa terpilih · 1–2 halaman A4 per siswa (jawaban panjang lanjut ke
            halaman berikutnya) · sidebar dan header tidak ikut tercetak.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            {items.length} lembar kerja
          </span>
          <PrintButton label="Print Lembar Kerja" className="btn-primary h-10 px-4 text-[13px]" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card-surface no-print p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-500">
            <IconFile className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-gray-700">Belum ada siswa yang dipilih</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Kembali ke dashboard, centang siswa yang sudah mengisi, lalu klik “Print Lembar
            Kerja”.
          </p>
          <Link href="/admin" className="btn-primary mt-5 h-10 px-4 text-[13px]">
            Pilih siswa
          </Link>
        </div>
      ) : (
        <div className="preview-wrap overflow-x-auto rounded-xl bg-gray-100 p-4">
          {items.map(({ student, submission }) => (
            <article key={student.id} className="worksheet mb-6 bg-white shadow-theme-lg last:mb-0">
              <Worksheet
                student={student}
                submission={submission}
                qrUrl={`${baseUrl}/lembar/${student.id}`}
              />
            </article>
          ))}
        </div>
      )}

      <p className="no-print flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
        <IconPrinter className="h-3.5 w-3.5" />
        Scan QR di lembar untuk membuka versi digitalnya. Cetak dengan A4 portrait, skala 100%,
        margin Default — jangan “None”, agar halaman lanjutan tetap punya margin.
      </p>
    </div>
  );
}
