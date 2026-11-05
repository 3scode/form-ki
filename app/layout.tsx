import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { AgentationDev } from "@/components/AgentationDev";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KI 2026 — Sistem Informasi Kunjungan Industri",
    template: "%s | KI 2026",
  },
  description:
    "Sistem informasi pengisian Lembar Kerja Kunjungan Industri 2026: login siswa, form dinamis per jurusan, kartu kredensial QR, dan dashboard admin.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#465fff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={outfit.variable}>
      <body>
        {children}
        {process.env.NODE_ENV === "development" && <AgentationDev />}
      </body>
    </html>
  );
}
