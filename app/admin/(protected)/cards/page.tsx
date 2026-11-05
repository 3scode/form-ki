import type { Metadata } from "next";
import { headers } from "next/headers";
import { readDb, uniqueValues } from "@/lib/store";
import { CardsPrintClient } from "./CardsPrintClient";

export const metadata: Metadata = { title: "Cetak Kartu Kredensial" };

export default async function CardsPage() {
  const db = await readDb();
  const students = [...db.students].sort(
    (a, b) => a.class.localeCompare(b.class, "id") || a.name.localeCompare(b.name, "id"),
  );

  // Pakai URL publik bila diset; kalau tidak, susun dari request yang sedang aktif
  // agar QR sudah terisi pada render pertama (tanpa menunggu hidrasi).
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const isLocal = !host || /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/.test(host);
  const protocol = headerStore.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : "");

  return (
    <CardsPrintClient
      students={students}
      classes={uniqueValues(db, "class")}
      majors={uniqueValues(db, "major")}
      envBaseUrl={envBaseUrl}
    />
  );
}
