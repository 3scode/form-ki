"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { IconClose, IconDownload, IconFile, IconUpload } from "@/components/Icons";

type ImportResult = {
  ok: true;
  sheet: string;
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  details: string[];
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function pickFile(candidate: File | undefined) {
    if (!candidate) return;
    const name = candidate.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("Format file harus .xlsx atau .xls.");
      return;
    }
    setError(null);
    setResult(null);
    setFile(candidate);
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nama", "NISN", "Kelas", "Jurusan"],
      ["Aditya Pratama", "0061234501", "12-TKR-1", "TKR"],
      ["Gita Nirmala Sari", "0061234507", "12-TKJ-1", "TKJ"],
      ["Lukman Hakim", "0061234512", "12-FKK-1", "FKK"],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "template-data-siswa-ki-2026.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    if (!file) {
      setError("Pilih file terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal mengimpor data.");
        if (Array.isArray(data.details) && data.details.length > 0) {
          setError(`${data.error}\n${data.details.join("\n")}`);
        }
        setLoading(false);
        return;
      }

      setResult(data as ImportResult);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="sr-only"
        onChange={(event) => pickFile(event.target.files?.[0])}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pickFile(event.dataTransfer.files?.[0]);
        }}
        className={`rounded-xl border border-dashed p-4 transition ${
          dragging ? "border-brand-400 bg-brand-25" : "border-gray-300 bg-gray-50"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-brand-500 ring-1 ring-gray-200">
              <IconFile className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">{formatSize(file.size)} · siap diimpor</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-600"
              aria-label="Batalkan file"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 py-4 text-center"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-500 shadow-theme-xs">
              <IconUpload className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-gray-700">
              Tarik file ke sini atau klik untuk memilih
            </span>
            <span className="text-[11px] text-gray-500">XLSX atau XLS · maks. 5 MB</span>
          </button>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 whitespace-pre-line rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-success-500/20 bg-success-50 p-4">
          <p className="text-sm font-semibold text-success-600">
            Import selesai — {result.inserted + result.updated} baris diproses
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["Baru", result.inserted],
              ["Diperbarui", result.updated],
              ["Dilewati", result.skipped],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg bg-white px-2 py-2 ring-1 ring-success-500/15">
                <p className="text-lg font-semibold text-gray-900">{value}</p>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
            Password dan QR Code siswa baru sudah dibuat. Buka{" "}
            <Link href="/admin/cards" className="font-semibold underline">
              Cetak Kartu
            </Link>{" "}
            untuk mencetak kredensial.
          </p>
          {result.details.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[11px] text-warning-600">
              {result.details.map((detail) => (
                <li key={detail}>· {detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleUpload}
          className="btn-primary flex-1"
          disabled={loading || !file}
        >
          {loading ? "Memproses file..." : "Import data siswa"}
        </button>
        <button type="button" onClick={downloadTemplate} className="btn-outline">
          <IconDownload className="h-4 w-4" />
          Template Excel
        </button>
      </div>
    </div>
  );
}
