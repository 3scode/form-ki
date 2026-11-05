"use client";

import { useEffect, useState } from "react";
import { IconClose, IconEdit, IconPlus, IconPrinter, IconTrash } from "@/components/Icons";
import { formatDateTime, initials } from "@/lib/format";
import { getMajorLabel, type Major } from "@/lib/types";
import {
  DeleteAllStudentsDialog,
  DeleteStudentDialog,
  StudentFormDialog,
} from "./StudentDialog";

export type StudentRow = {
  id: string;
  name: string;
  nisn: string;
  class: string;
  major: Major;
  password: string;
  is_submitted: boolean;
  submitted_at: string | null;
  photo_url: string | null;
};

export function StudentsTable({ rows, classes }: { rows: StudentRow[]; classes: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [photo, setPhoto] = useState<StudentRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [deleting, setDeleting] = useState<StudentRow | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const rowKey = rows.map((row) => row.id).join("|");

  useEffect(() => {
    setSelected(new Set());
  }, [rowKey]);

  useEffect(() => {
    if (!photo) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPhoto(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo]);

  const selectable = rows.filter((row) => row.is_submitted);
  const allSelected = selectable.length > 0 && selectable.every((row) => selected.has(row.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(selectable.map((row) => row.id)));
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openPrint() {
    if (selected.size === 0) return;
    const ids = [...selected].join(",");
    window.open(`/admin/print?ids=${encodeURIComponent(ids)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 bg-gray-25 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <p className="text-xs text-gray-500">
          {selected.size > 0 ? (
            <>
              <span className="font-semibold text-gray-800">{selected.size}</span> siswa dipilih ·{" "}
              {selected.size} halaman A4
            </>
          ) : (
            "Centang siswa yang sudah mengisi untuk mencetak lembar kerja."
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="btn-outline h-9 px-3.5 text-xs"
          >
            <IconPlus className="h-4 w-4" />
            Tambah siswa
          </button>
          <button
            type="button"
            onClick={() => setPurgeOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-error-500/30 px-3.5 text-xs font-semibold text-error-600 transition hover:bg-error-50"
          >
            <IconTrash className="h-4 w-4" />
            Hapus semua data
          </button>
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              Bersihkan
            </button>
          ) : null}
          <button
            type="button"
            onClick={openPrint}
            disabled={selected.size === 0}
            className="btn-primary h-9 px-3.5 text-xs"
          >
            <IconPrinter className="h-4 w-4" />
            Print Lembar Kerja
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Pilih semua siswa yang sudah mengisi"
                  className="h-4 w-4 rounded border-gray-300 accent-brand-500"
                  checked={allSelected}
                  disabled={selectable.length === 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 font-semibold">Nama siswa</th>
              <th className="px-4 py-3 font-semibold">NISN</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold">Jurusan</th>
              <th className="px-4 py-3 font-semibold">Password</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Foto</th>
              <th className="px-4 py-3 font-semibold">Waktu kirim</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center">
                  <p className="text-sm font-medium text-gray-700">Tidak ada siswa yang cocok</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Coba ubah kata kunci atau filter status/kelas/jurusan.
                  </p>
                </td>
              </tr>
            ) : null}

            {rows.map((row) => (
              <tr key={row.id} className="bg-white transition hover:bg-gray-25">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${row.name}`}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-500 disabled:opacity-40"
                    checked={selected.has(row.id)}
                    disabled={!row.is_submitted}
                    onChange={() => toggleOne(row.id)}
                  />
                </td>
                <td className="max-w-[220px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {initials(row.name)}
                    </span>
                    <span className="truncate font-medium text-gray-900">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.nisn}</td>
                <td className="px-4 py-3 text-gray-600">{row.class}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-brand-50 text-brand-700">{getMajorLabel(row.major)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-gray-50 px-2 py-1 font-mono text-xs font-semibold tracking-[0.12em] text-gray-700 ring-1 ring-gray-200">
                    {row.password}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.is_submitted ? (
                    <span className="badge bg-success-50 text-success-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                      Sudah mengisi
                    </span>
                  ) : (
                    <span className="badge bg-warning-50 text-warning-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
                      Belum mengisi
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.photo_url ? (
                    <button
                      type="button"
                      onClick={() => setPhoto(row)}
                      className="group relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-gray-200"
                      title={`Lihat foto ${row.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.photo_url}
                        alt={`Foto ${row.name}`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {row.submitted_at ? formatDateTime(row.submitted_at) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      title={`Edit ${row.name}`}
                      aria-label={`Edit ${row.name}`}
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(row)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-error-50 hover:text-error-600"
                      title={`Hapus ${row.name}`}
                      aria-label={`Hapus ${row.name}`}
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen || editing ? (
        <StudentFormDialog
          student={editing}
          classes={classes}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteStudentDialog student={deleting} onClose={() => setDeleting(null)} />
      ) : null}

      {purgeOpen ? <DeleteAllStudentsDialog onClose={() => setPurgeOpen(false)} /> : null}

      {photo ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-4"
          onClick={() => setPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${photo.name}`}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-theme-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Validasi foto siswa</h3>
                <p className="text-xs text-gray-500">
                  {photo.name} · {photo.class} · {getMajorLabel(photo.major)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Tutup"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.photo_url ?? ""}
                alt={`Foto ${photo.name}`}
                className="max-h-[60vh] w-full rounded-xl bg-gray-50 object-contain"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span>
                  NISN <span className="font-mono text-gray-700">{photo.nisn}</span>
                </span>
                <span>{photo.submitted_at ? `Dikirim ${formatDateTime(photo.submitted_at)}` : ""}</span>
              </div>
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
                Pastikan foto benar-benar siswa yang bersangkutan dan diambil saat kegiatan
                kunjungan industri berlangsung.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
