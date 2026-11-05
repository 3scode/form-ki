import { WorksheetQr } from "@/components/WorksheetQr";
import { formatDate } from "@/lib/format";
import { HISTORY_TOPIC } from "@/lib/questions";
import { getMajorLabel } from "@/lib/types";
import type { Student, Submission } from "@/lib/types";

type WorksheetProps = {
  student: Student;
  submission?: Submission;
  /** URL halaman publik yang dibuka saat QR pada lembar dipindai. */
  qrUrl?: string;
};

export function Worksheet({ student, submission, qrUrl }: WorksheetProps) {
  return (
    <>
      <header className="border-b-2 border-gray-900 pb-4">
        <div className="flex items-start gap-3">
          <img
            src="/logo.webp"
            alt="Logo SMK Muhammadiyah Kandanghaur"
            width={384}
            height={384}
            className="h-[16mm] w-[16mm] shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[8.5pt] font-semibold uppercase tracking-[0.18em] text-brand-600">
              Sistem Informasi Kunjungan Industri
            </p>
            <h1 className="mt-1.5 text-[17pt] font-bold leading-tight text-gray-900">
              Lembar Kerja Kunjungan Industri 2026
            </h1>
          </div>
          {qrUrl ? <WorksheetQr value={qrUrl} /> : null}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-10 gap-y-1.5 text-[10pt]">
          {[
            ["Nama", student.name],
            ["NISN", student.nisn],
            ["Kelas", student.class],
            ["Jurusan", getMajorLabel(student.major)],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-[18mm] shrink-0 text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900">: {value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-5 space-y-4">
        <section>
          <h2 className="text-[11pt] font-semibold text-gray-900">
            A. Sejarah {HISTORY_TOPIC[student.major]}
          </h2>
          <p className="mt-0.5 text-[9pt] italic text-gray-500">
            Tuliskan secara ringkas sejarah {HISTORY_TOPIC[student.major]}.
          </p>
          <p className="mt-2 whitespace-pre-line text-[10.5pt] leading-relaxed text-gray-800">
            {submission?.answer_history}
          </p>
        </section>

        <section>
          <h2 className="text-[11pt] font-semibold text-gray-900">
            B. Manfaat Kegiatan Kunjungan Industri
          </h2>
          <p className="mt-0.5 text-[9pt] italic text-gray-500">
            Manfaat kegiatan kunjungan industri.
          </p>
          <p className="mt-2 whitespace-pre-line text-[10.5pt] leading-relaxed text-gray-800">
            {submission?.answer_benefit}
          </p>
        </section>

        <section>
          <h2 className="text-[11pt] font-semibold text-gray-900">
            C. Hasil Kegiatan Kunjungan Industri
          </h2>
          <p className="mt-0.5 text-[9pt] italic text-gray-500">
            Hasil dari kegiatan kunjungan industri.
          </p>
          <p className="mt-2 whitespace-pre-line text-[10.5pt] leading-relaxed text-gray-800">
            {submission?.answer_result}
          </p>
        </section>

        <section>
          <h2 className="text-[11pt] font-semibold text-gray-900">
            D. Lampiran: Foto Kegiatan
          </h2>
          {submission?.photo_url ? (
            <img
              src={submission.photo_url}
              alt={`Foto kegiatan ${student.name}`}
              className="mt-2 max-h-[60mm] rounded border border-gray-300 object-contain"
            />
          ) : null}
        </section>
      </div>

      <footer className="mt-6 flex justify-end">
        <div className="text-center text-[10pt] leading-relaxed text-gray-800">
          <p>
            Yogyakarta, {submission ? formatDate(submission.created_at) : "........................"}
          </p>
          <p>Wakahumas</p>
          <div className="h-[16mm]" />
          <p className="font-semibold">(....................................................)</p>
        </div>
      </footer>
    </>
  );
}
