import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { LogoutButton } from "@/components/LogoutButton";
import { IconCheckCircle, IconClock } from "@/components/Icons";
import { formatDateTime } from "@/lib/format";
import { HISTORY_QUESTIONS, HISTORY_TOPIC } from "@/lib/questions";
import { requireStudent } from "@/lib/session";
import { getSubmission, readDb } from "@/lib/store";
import { getMajorLabel } from "@/lib/types";
import { SubmissionForm } from "./SubmissionForm";

export const metadata: Metadata = { title: "Form Kunjungan Industri" };

export default async function FormPage() {
  const student = await requireStudent();
  const db = await readDb();
  const submission = getSubmission(db, student.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Brand href="/form" />
          <div className="flex items-center gap-1.5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-gray-800">{student.name}</p>
              <p className="text-[11px] text-gray-500">
                {student.class} · {getMajorLabel(student.major)}
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
              {student.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")}
            </span>
            <LogoutButton endpoint="/api/auth/logout" redirectTo="/login" label="Keluar" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {submission ? (
          <div className="space-y-4">
            <div className="card-surface p-6 text-center sm:p-8">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600">
                <IconCheckCircle className="h-8 w-8" />
              </span>
              <h1 className="mt-5 text-xl font-semibold text-gray-900">
                Lembar kerja sudah dikirim
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                Terima kasih, {student.name.split(" ")[0]}. Jawabanmu sudah tersimpan dan tidak
                dapat diubah lagi.                Panitia akan memverifikasi foto kegiatan dan jawabanmu.
              </p>
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-xs text-gray-600">
                <IconClock className="h-4 w-4 text-gray-400" />
                Dikirim {formatDateTime(submission.created_at)} WIB
              </div>
            </div>

            <div className="card-surface p-6">
              <h2 className="text-sm font-semibold text-gray-900">Identitas</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["Nama", student.name],
                  ["NISN", student.nisn],
                  ["Kelas", student.class],
                  ["Jurusan", getMajorLabel(student.major)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-gray-200 px-3.5 py-2.5">
                    <dt className="text-[11px] uppercase tracking-wide text-gray-500">{label}</dt>
                    <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card-surface overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Jawaban lembar kerja</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  [`Sejarah ${HISTORY_TOPIC[student.major]}`, submission.answer_history],
                  ["Manfaat kunjungan industri", submission.answer_benefit],
                  ["Hasil kunjungan industri", submission.answer_result],
                ].map(([label, value]) => (
                  <div key={label} className="px-6 py-4">
                    <p className="text-xs font-semibold text-gray-500">{label}</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                      {value}
                    </p>
                  </div>
                ))}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-gray-500">
                    Foto kegiatan ({submission.photo_urls.length})
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {submission.photo_urls.map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${url}-${index}`}
                        src={url}
                        alt={`Foto kegiatan ${index + 1} ${student.name}`}
                        className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-4">
              <LogoutButton
                endpoint="/api/auth/logout"
                redirectTo="/login"
                label="Keluar dari akun"
                className="btn-outline h-11 px-5 text-sm"
              />
            </div>
          </div>
        ) : (
          <SubmissionForm
            name={student.name}
            nisn={student.nisn}
            className={student.class}
            major={student.major}
            historyQuestion={HISTORY_QUESTIONS[student.major]}
            historyTopic={HISTORY_TOPIC[student.major]}
          />
        )}
      </main>
    </div>
  );
}
