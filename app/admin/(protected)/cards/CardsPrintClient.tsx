"use client";

import { useEffect, useMemo, useState } from "react";
import { CredentialCard } from "@/components/CredentialCard";
import { IconPrinter, IconQr } from "@/components/Icons";
import { getMajorLabel, type Major } from "@/lib/types";
import type { Student } from "@/lib/types";

const PER_SHEET = 10;

export function CardsPrintClient({
  students,
  classes,
  majors,
  envBaseUrl,
}: {
  students: Student[];
  classes: string[];
  majors: Major[];
  envBaseUrl: string;
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [majorFilter, setMajorFilter] = useState("all");
  const [baseUrl, setBaseUrl] = useState(envBaseUrl);

  useEffect(() => {
    if (!envBaseUrl) setBaseUrl(window.location.origin);
  }, [envBaseUrl]);

  const filtered = useMemo(
    () =>
      students.filter((student) => {
        if (classFilter !== "all" && student.class !== classFilter) return false;
        if (majorFilter !== "all" && student.major !== majorFilter) return false;
        return true;
      }),
    [students, classFilter, majorFilter],
  );

  const sheets = useMemo(() => {
    const result: Student[][] = [];
    for (let index = 0; index < filtered.length; index += PER_SHEET) {
      result.push(filtered.slice(index, index + PER_SHEET));
    }
    return result;
  }, [filtered]);

  const qrBase = baseUrl.trim().replace(/\/+$/, "");
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(qrBase);
  const filteredOut = students.length - filtered.length;
  const resetDisabled = classFilter === "all" && majorFilter === "all";

  return (
    <div className="space-y-5">
      <div className="no-print">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Cetak kartu kredensial siswa
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Setiap kartu memuat branding, nama & kelas, NISN, password 6 digit, QR Code, dan
          instruksi login.
        </p>
      </div>

      <div className="card-surface no-print p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[170px_170px_auto]">
          <div>
            <label htmlFor="card-class" className="form-label">
              Kelas
            </label>
            <select
              id="card-class"
              className="form-input"
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
            >
              <option value="all">Semua kelas</option>
              {classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="card-major" className="form-label">
              Jurusan
            </label>
            <select
              id="card-major"
              className="form-input"
              value={majorFilter}
              onChange={(event) => setMajorFilter(event.target.value)}
            >
              <option value="all">Semua jurusan</option>
              {majors.map((item) => (
                <option key={item} value={item}>
                  {getMajorLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setClassFilter("all");
                setMajorFilter("all");
              }}
              disabled={resetDisabled}
              className="btn-outline h-11 px-4 text-[13px]"
            >
              Reset filter
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={filtered.length === 0 || !qrBase}
              className="btn-primary h-11 flex-1 px-5"
            >
              <IconPrinter className="h-4 w-4" />
              Cetak {filtered.length} kartu
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="card-base-url" className="form-label">
            URL publik aplikasi (dipakai di dalam QR Code)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="card-base-url"
              className="form-input font-mono text-xs"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://ki2026.sekolah.sch.id"
              spellCheck={false}
            />
          </div>
          {isLocal || !qrBase ? (
            <p className="mt-2 rounded-lg border border-warning-500/25 bg-warning-50 px-3 py-2 text-[11px] leading-relaxed text-warning-600">
              Alamat ini masih lokal. QR hanya bisa dipindai dari HP jika URL diganti dengan
              domain publik hasil deploy (atau set variabel <code>NEXT_PUBLIC_APP_URL</code>).
            </p>
          ) : (
            <p className="form-hint">
              QR berisi <span className="font-mono">{qrBase}/qr/&lt;token-siswa&gt;</span>
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            {filtered.length} kartu
          </span>
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            {sheets.length} lembar A4
          </span>
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            85,6 × 53,98 mm
          </span>
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            2 × 5 per lembar
          </span>
          <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
            jarak rata 12,9 mm + garis potong
          </span>
          {filteredOut > 0 ? (
            <span className="text-gray-400">· {filteredOut} siswa tersaring</span>
          ) : null}
        </div>

        <details className="group mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold text-gray-700 marker:text-gray-400">
            Panduan hasil cetak
          </summary>
          <ol className="mt-2 space-y-1 text-[11px] leading-relaxed text-gray-500">
            <li>1. Klik Cetak, pilih printer atau “Save as PDF”.</li>
            <li>2. Ukuran kertas A4 portrait, skala 100% (Actual size), margin None.</li>
            <li>3. Aktifkan “Background graphics” agar warna kartu ikut tercetak.</li>
            <li>
              4. Potong mengikuti garis putus-putus. Jarak antarkartu 12,9 mm dan sama dengan margin
              kiri/kanan, jadi hasil potongan tetap simetris.
            </li>
          </ol>
        </details>
      </div>

      {!qrBase ? (
        <div className="card-surface no-print p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-500">
            <IconQr className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-gray-700">Menentukan alamat QR...</p>
          <p className="mt-1 text-xs text-gray-500">
            Isi URL publik di atas apabila alamat otomatis tidak sesuai.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface no-print p-10 text-center">
          <p className="text-sm font-medium text-gray-700">Tidak ada kartu untuk filter ini</p>
          <p className="mt-1 text-xs text-gray-500">Ubah pilihan kelas atau jurusan.</p>
        </div>
      ) : (
        <div className="preview-wrap rounded-xl bg-gray-100 p-4">
          {sheets.map((sheet, sheetIndex) => (
            <div key={`sheet-${sheetIndex}`} className="sheet-wrap mb-8 last:mb-0">
              <div className="sheet-label mb-2 flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  Lembar {sheetIndex + 1} dari {sheets.length} · {sheet.length} kartu
                </span>
                <span>A4 portrait · 210 × 297 mm</span>
              </div>
              <div className="cred-sheet overflow-hidden bg-white shadow-theme-lg">
                {sheet.map((student) => (
                  <CredentialCard
                    key={student.id}
                    student={student}
                    qrUrl={`${qrBase}/qr/${student.login_token}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
