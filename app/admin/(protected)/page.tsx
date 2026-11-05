import type { Metadata } from "next";
import Link from "next/link";
import { PerPageSelect } from "@/components/admin/PerPageSelect";
import { StudentsTable, type StudentRow } from "@/components/admin/StudentsTable";
import {
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconQr,
  IconSearch,
  IconUsers,
} from "@/components/Icons";
import { getSubmission, readDb, uniqueValues } from "@/lib/store";
import type { Student } from "@/lib/types";
import { getMajorLabel, MAJORS, type Major } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard Admin" };

const DEFAULT_PER_PAGE = 10;
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Deret nomor halaman ringkas: 1 … 4 5 6 … 20 supaya tidak membungkus. */
function pageItems(current: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push("gap");
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);

  return items;
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const status = first(params.status) || "all";
  const classFilter = first(params.class) || "all";
  const majorFilter = first(params.major) || "all";
  const requestedPage = Number.parseInt(first(params.page) || "1", 10);
  const requestedPerPage = Number.parseInt(first(params.perPage), 10);
  const perPage = PER_PAGE_OPTIONS.includes(requestedPerPage) ? requestedPerPage : DEFAULT_PER_PAGE;

  const db = await readDb();
  const classes = uniqueValues(db, "class");
  const majors = uniqueValues(db, "major");

  const submittedCount = db.students.filter((student) => student.is_submitted).length;
  const total = db.students.length;
  const pendingCount = total - submittedCount;
  const percent = total === 0 ? 0 : Math.round((submittedCount / total) * 100);

  const query = q.toLowerCase();
  const filtered = db.students
    .filter((student) => {
      if (query && !`${student.name} ${student.nisn}`.toLowerCase().includes(query)) return false;
      if (status === "submitted" && !student.is_submitted) return false;
      if (status === "pending" && student.is_submitted) return false;
      if (classFilter !== "all" && student.class !== classFilter) return false;
      if (majorFilter !== "all" && student.major !== majorFilter) return false;
      return true;
    })
    .sort((a, b) => a.class.localeCompare(b.class, "id") || a.name.localeCompare(b.name, "id"));

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  const rows: StudentRow[] = paged.map((student: Student) => {
    const submission = getSubmission(db, student.id);
    return {
      ...student,
      submitted_at: submission?.created_at ?? null,
      photo_url: submission?.photo_url ?? null,
    };
  });

  function hrefForPage(target: number) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status !== "all") search.set("status", status);
    if (classFilter !== "all") search.set("class", classFilter);
    if (majorFilter !== "all") search.set("major", majorFilter);
    if (perPage !== DEFAULT_PER_PAGE) search.set("perPage", String(perPage));
    search.set("page", String(target));
    return `/admin?${search.toString()}`;
  }

  const stats = [
    {
      label: "Total siswa",
      value: total,
      hint: "Seluruh data master",
      icon: IconUsers,
      tone: "bg-brand-50 text-brand-600",
      badge: `${classes.length} kelas`,
    },
    {
      label: "Sudah mengisi",
      value: submittedCount,
      hint: "Lembar kerja terkirim",
      icon: IconCheckCircle,
      tone: "bg-success-50 text-success-600",
      badge: `${percent}%`,
    },
    {
      label: "Belum mengisi",
      value: pendingCount,
      hint: "Perlu diingatkan",
      icon: IconClock,
      tone: "bg-warning-50 text-warning-600",
      badge: "Pending",
    },
    {
      label: "Kelas terdaftar",
      value: classes.length,
      hint: "Rombel aktif",
      icon: IconQr,
      tone: "bg-gray-100 text-gray-600",
      badge: `${majors.length} jurusan`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            Tracking pengisian lembar kerja
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pantau status pengisian, validasi foto, dan siapkan cetak lembar kerja.
          </p>
        </div>
        <Link href="/admin/cards" className="btn-outline h-10 px-4 text-[13px]">
          <IconQr className="h-4 w-4" />
          Cetak kartu kredensial
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <span className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200">
                {stat.badge}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="card-surface p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600">Progres pengisian keseluruhan</span>
          <span className="font-semibold text-brand-600">
            {submittedCount}/{total} siswa
          </span>
        </div>
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="card-surface">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_170px_auto]">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                className="form-input pl-10"
                placeholder="Cari nama atau NISN..."
                aria-label="Cari siswa"
              />
            </div>
            <select name="status" defaultValue={status} className="form-input" aria-label="Filter status">
              <option value="all">Semua status</option>
              <option value="submitted">Sudah mengisi</option>
              <option value="pending">Belum mengisi</option>
            </select>
            <select name="class" defaultValue={classFilter} className="form-input" aria-label="Filter kelas">
              <option value="all">Semua kelas</option>
              {classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select name="major" defaultValue={majorFilter} className="form-input" aria-label="Filter jurusan">
              <option value="all">Semua jurusan</option>
              {majors.map((item) => (
                <option key={item} value={item}>
                  {getMajorLabel(item as Major)}
                </option>
              ))}
            </select>
            <input type="hidden" name="perPage" value={perPage} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary h-11 flex-1 px-4 text-[13px]">
                Filter
              </button>
              <Link
                href={perPage === DEFAULT_PER_PAGE ? "/admin" : `/admin?perPage=${perPage}`}
                className="btn-outline h-11 px-3.5 text-[13px]"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        <StudentsTable rows={rows} classes={classes} />

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 text-xs text-gray-500 sm:flex-row sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + perPage, filtered.length)}
              </span>{" "}
              dari <span className="font-medium text-gray-700">{filtered.length}</span> siswa
            </p>
            <PerPageSelect
              value={perPage}
              options={PER_PAGE_OPTIONS}
              defaultValue={DEFAULT_PER_PAGE}
            />
          </div>
          <nav className="flex items-center gap-1.5" aria-label="Navigasi halaman">
            <Link
              href={hrefForPage(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              aria-label="Halaman sebelumnya"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gray-200 ${
                page === 1
                  ? "pointer-events-none text-gray-300"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Link>
            {pageItems(page, totalPages).map((item, index) =>
              item === "gap" ? (
                <span
                  key={`gap-${index}`}
                  className="grid h-8 w-6 place-items-center text-gray-400"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={hrefForPage(item)}
                  aria-label={`Halaman ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={`grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-medium ${
                    item === page
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </Link>
              ),
            )}
            <Link
              href={hrefForPage(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              aria-label="Halaman berikutnya"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gray-200 ${
                page === totalPages
                  ? "pointer-events-none text-gray-300"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
