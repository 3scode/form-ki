"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import {
  IconClose,
  IconGrid,
  IconMenu,
  IconPrinter,
  IconQr,
  IconUpload,
  IconUser,
} from "@/components/Icons";
import { LogoutButton } from "@/components/LogoutButton";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconGrid },
  { href: "/admin/import", label: "Import Data", icon: IconUpload },
  { href: "/admin/cards", label: "Cetak Kartu", icon: IconQr },
];

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/import": "Import Data Siswa",
  "/admin/cards": "Cetak Kartu Kredensial",
  "/admin/print": "Cetak Lembar Kerja",
};

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-gray-950/50 lg:hidden"
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <Brand href="/admin" subtitle="Panel panitia" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Tutup menu"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Menu utama
          </p>
          <ul className="mt-3 space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <IconPrinter className="h-4 w-4 text-gray-500" />
              Alur cetak
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              Cetak kartu kredensial lewat menu <span className="font-medium text-gray-700">Cetak Kartu</span>.
              Lembar kerja siswa dicetak dari dashboard setelah memilih siswa yang sudah mengisi.
            </p>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
              {initials(email.split("@")[0].replace(".", " "))}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">Panitia KI 2026</p>
              <p className="truncate text-[11px] text-gray-500">{email}</p>
            </div>
          </div>
          <LogoutButton
            endpoint="/api/admin/logout"
            redirectTo="/admin/login"
            label="Keluar dari admin"
            className="mt-1 w-full justify-start hover:bg-error-50 hover:text-error-600"
          />
        </div>
      </aside>

      <div className="admin-main-wrap lg:pl-[290px]">
        <header className="admin-header sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
                aria-label="Buka menu"
              >
                <IconMenu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h1>
                <p className="hidden text-[11px] text-gray-500 sm:block">
                  Sistem Informasi Kunjungan Industri 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:inline-flex"
              >
                <IconUser className="h-3.5 w-3.5" />
                Lihat situs
              </Link>
              <Link
                href="/admin/cards"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white hover:bg-brand-600"
              >
                <IconQr className="h-4 w-4" />
                Cetak kartu
              </Link>
            </div>
          </div>
        </header>

        <main className="admin-content mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
