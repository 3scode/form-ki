import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { PrintButton } from "@/components/PrintButton";
import { Worksheet } from "@/components/Worksheet";
import { WorksheetFit } from "@/components/WorksheetFit";
import { getBaseUrl } from "@/lib/base-url";
import { readDb } from "@/lib/store";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = await readDb();
  const student = db.students.find((item) => item.id === id);

  return {
    title: student ? `Lembar Kerja ${student.name}` : "Lembar kerja tidak ditemukan",
    robots: { index: false, follow: false },
  };
}

export default async function PublicWorksheetPage({ params }: PageProps) {
  const { id } = await params;
  const db = await readDb();
  const student = db.students.find((item) => item.id === id);
  const submission = student
    ? db.submissions.find((item) => item.student_id === student.id)
    : undefined;

  if (!student || !submission) notFound();

  const baseUrl = await getBaseUrl();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="no-print border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Brand href="/" />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:block">
              Lembar kerja {student.name} · {student.class}
            </span>
            <PrintButton label="Simpan PDF" className="btn-primary h-10 px-4 text-[13px]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-2 py-5 sm:px-4 sm:py-8">
        <div className="preview-wrap overflow-x-auto rounded-xl bg-gray-200/70 p-3 sm:p-6">
          <article className="worksheet mx-auto bg-white shadow-theme-lg">
            <WorksheetFit>
              <Worksheet
                student={student}
                submission={submission}
                qrUrl={`${baseUrl}/lembar/${student.id}`}
              />
            </WorksheetFit>
          </article>
        </div>
        <p className="no-print mt-4 text-center text-[11px] text-gray-400">
          Halaman ini terbuka dari QR pada lembar kerja tercetak. Tombol “Simpan PDF” membuka
          dialog cetak — pilih tujuan “Save as PDF”.
        </p>
      </main>
    </div>
  );
}
