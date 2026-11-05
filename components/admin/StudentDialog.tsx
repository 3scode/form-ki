"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconClose, IconPlus, IconTrash } from "@/components/Icons";
import { getMajorLabel, MAJORS, type Major } from "@/lib/types";
import type { StudentRow } from "./StudentsTable";

type FormProps = {
  /** null berarti tambah siswa baru. */
  student: StudentRow | null;
  classes: string[];
  onClose: () => void;
};

export function StudentFormDialog({ student, classes, onClose }: FormProps) {
  const router = useRouter();
  const [name, setName] = useState(student?.name ?? "");
  const [nisn, setNisn] = useState(student?.nisn ?? "");
  const [className, setClassName] = useState(student?.class ?? "");
  const [major, setMajor] = useState<Major>(student?.major ?? MAJORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch(student ? `/api/students/${student.id}` : "/api/students", {
        method: student ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nisn, class: className, major }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan data siswa.");
        setSaving(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/60 p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={student ? "Edit data siswa" : "Tambah siswa"}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-theme-lg"
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {student ? "Edit data siswa" : "Tambah siswa"}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {student
                ? "Password, token QR, dan status pengisian tidak berubah."
                : "Password 6 digit dan token QR dibuat otomatis."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Tutup"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-error-500/20 bg-error-50 px-3 py-2 text-xs text-error-600"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="student-name" className="form-label">
              Nama siswa
            </label>
            <input
              id="student-name"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama lengkap"
              maxLength={150}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="student-nisn" className="form-label">
                NISN
              </label>
              <input
                id="student-nisn"
                className="form-input font-mono"
                value={nisn}
                onChange={(event) => setNisn(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 digit angka"
                inputMode="numeric"
                pattern="\d{10}"
                title="NISN harus 10 digit angka"
                required
              />
            </div>
            <div>
              <label htmlFor="student-class" className="form-label">
                Kelas
              </label>
              <input
                id="student-class"
                className="form-input"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Contoh: XII TKJ 1"
                list="student-class-options"
                maxLength={50}
                required
              />
              <datalist id="student-class-options">
                {classes.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label htmlFor="student-major" className="form-label">
              Jurusan
            </label>
            <select
              id="student-major"
              className="form-input"
              value={major}
              onChange={(event) => setMajor(event.target.value as Major)}
            >
              {MAJORS.map((item) => (
                <option key={item} value={item}>
                  {item} — {getMajorLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-outline h-10 px-4 text-[13px]"
          >
            Batal
          </button>
          <button type="submit" disabled={saving} className="btn-primary h-10 px-4 text-[13px]">
            {saving ? "Menyimpan..." : student ? "Simpan perubahan" : "Tambah siswa"}
            {!saving ? <IconPlus className="h-4 w-4" /> : null}
          </button>
        </div>
      </form>
    </div>
  );
}

export function DeleteAllStudentsDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const confirmed = confirmation.trim().toUpperCase() === "HAPUS";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting, onClose]);

  async function handleDelete() {
    if (!confirmed) return;
    setError(null);
    setDeleting(true);

    try {
      const response = await fetch("/api/students", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus data siswa.");
        setDeleting(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/60 p-4"
      onClick={() => {
        if (!deleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Hapus semua data siswa"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-theme-lg"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-error-50 text-error-600">
          <IconTrash className="h-5 w-5" />
        </span>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">Hapus semua data siswa?</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Seluruh data siswa akan dihapus permanen: NISN, nama, kelas, jurusan, password, token QR,
          file foto di Cloudinary, serta jawaban lembar kerja yang sudah dikirim. Tindakan ini tidak
          bisa dibatalkan.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-error-500/20 bg-error-50 px-3 py-2 text-xs text-error-600"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          <label htmlFor="purge-confirmation" className="form-label">
            Ketik <span className="font-mono font-semibold text-gray-700">HAPUS</span> untuk
            melanjutkan
          </label>
          <input
            id="purge-confirmation"
            className="form-input"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="HAPUS"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-outline h-10 px-4 text-[13px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || !confirmed}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-error-500 px-4 text-[13px] font-semibold text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconTrash className="h-4 w-4" />
            {deleting ? "Menghapus..." : "Hapus semua data"}
          </button>
        </div>
      </div>
    </div>
  );
}

type DeleteProps = {
  student: StudentRow;
  onClose: () => void;
};

export function DeleteStudentDialog({ student, onClose }: DeleteProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting, onClose]);

  async function handleDelete() {
    setError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus siswa.");
        setDeleting(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/60 p-4"
      onClick={() => {
        if (!deleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Hapus ${student.name}`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-theme-lg"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-error-50 text-error-600">
          <IconTrash className="h-5 w-5" />
        </span>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">Hapus siswa ini?</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          <span className="font-medium text-gray-700">{student.name}</span> ({student.nisn}) akan
          dihapus permanen, termasuk file foto di Cloudinary dan jawaban lembar kerja yang sudah
          dikirim.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-error-500/20 bg-error-50 px-3 py-2 text-xs text-error-600"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-outline h-10 px-4 text-[13px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-error-500 px-4 text-[13px] font-semibold text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconTrash className="h-4 w-4" />
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
