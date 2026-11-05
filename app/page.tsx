import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Brand } from "@/components/Brand";
import {
  IconArrowRight,
  IconCheckCircle,
  IconPrinter,
  IconQr,
  IconSpark,
  IconUpload,
} from "@/components/Icons";

const FEATURES = [
  {
    icon: IconQr,
    title: "Login cepat lewat QR",
    body: "Scan QR di kartu kredensial, konfirmasi data diri, lalu langsung masuk ke form tanpa mengetik.",
  },
  {
    icon: IconSpark,
    title: "Pertanyaan sesuai jurusan",
    body: "Sistem menyiapkan pertanyaan sejarah secara otomatis — BLPT Yogyakarta atau Merapi Farma Herbal.",
  },
  {
    icon: IconPrinter,
    title: "Cetak massal & rapi",
    body: "Kartu kredensial 10 per lembar A4 dan lembar kerja siap cetak untuk seluruh siswa.",
  },
];

const STEPS = [
  {
    title: "Terima kartu kredensial",
    body: "Kartu berisi NISN, password 6 digit, dan QR Code yang dibagikan panitia.",
  },
  {
    title: "Scan QR atau login manual",
    body: "Scan QR untuk auto-login, atau masuk dengan NISN dan password di halaman login.",
  },
  {
    title: "Isi dan kirim lembar kerja",
    body: "Unggah foto diri saat kunjungan, jawab pertanyaan, lalu kirim. Status otomatis terbarui.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="flex items-center gap-1.5">
            <Link
              href="/admin"
              className="btn-ghost hidden h-10 px-3 text-[13px] font-medium sm:inline-flex"
            >
              Login admin
            </Link>
            <Link
              href="/login"
              className="btn-primary h-10 gap-1.5 px-4 text-[13px] font-medium"
            >
              Login siswa
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#ecf3ff_0%,#ffffff_70%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <span className="badge border border-brand-200 bg-brand-50 text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Kunjungan Industri 2026
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
                Lembar kerja kunjungan industri,{" "}
                <span className="text-brand-600">kini serba digital.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600">
                Satu tempat untuk login siswa, mengisi lembar kerja sesuai jurusan, memantau
                progres pengisian, hingga mencetak kartu kredensial QR dan lembar kerja A4.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="btn-primary">
                  Masuk sebagai siswa
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/admin" className="btn-outline">
                  Buka dashboard admin
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                {[
                  ["10", "kartu per lembar A4"],
                  ["6", "jurusan terlayani"],
                  ["100%", "mobile-first"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-semibold text-gray-900">{value}</dt>
                    <dd className="mt-1 text-xs leading-snug text-gray-500">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute inset-x-6 top-8 h-56 rotate-[-6deg] rounded-2xl border border-gray-200 bg-gray-50" />
              <div className="relative rotate-[2deg] rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <img src="/logo.webp" alt="" width={384} height={384} className="h-8 w-8 object-contain" />
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-800">
                      Kartu Kunjungan Industri <span className="text-brand-600">2026</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-600">
                    PESERTA
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-gray-900">Muhammad Zamaludin</p>
                    <p className="text-[11px] font-medium text-gray-500">XI TKJ 2 - Teknik Komputer dan Jaringan</p>
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      NISN
                    </p>
                    <p className="font-mono text-xs font-semibold text-gray-800">0061234501</p>
                    <div className="mt-2 inline-flex items-baseline gap-2 rounded-lg border border-brand-200 bg-brand-25 px-2 py-1">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                        Sandi
                      </span>
                      <span className="font-mono text-base font-bold tracking-[0.16em] text-brand-950">
                        482913
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="rounded-lg border border-gray-200 p-1.5">
                      <QRCodeSVG
                        value="https://ki2026.example/qr/7f3c9a1b2d4e6f8091a2b3c4"
                        size={86}
                        level="M"
                        marginSize={0}
                        fgColor="#101828"
                      />
                    </div>
                    <p className="mt-1 text-[8px] text-gray-500">Scan untuk login</p>
                  </div>
                </div>
                <p className="mt-3 border-t border-gray-100 pt-2 text-[9px] text-gray-500">
                  Scan QR atau login memakai <span className="font-semibold text-gray-700">NISN + password</span>
                </p>
              </div>
              <div className="absolute -bottom-6 -left-3 hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-theme-lg sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-success-50 text-success-600">
                  <IconCheckCircle className="h-5 w-5" />
                </span>
                <div className="text-[11px] leading-tight">
                  <p className="font-semibold text-gray-800">Sudah mengisi</p>
                  <p className="text-gray-500">8 dari 18 siswa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-8 max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Dirancang untuk alur sekolah
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Admin menyiapkan data sekali, siswa mengisi dari HP masing-masing, panitia tinggal
                memantau dan mencetak.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="card-surface p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                Alur siswa
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                Tiga langkah, selesai dari HP
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Tidak perlu install aplikasi. Semua halaman dioptimalkan untuk layar ponsel dan
                tetap nyaman dibuka di komputer.
              </p>
              <Link href="/login" className="btn-outline mt-6">
                <IconQr className="h-4 w-4" />
                Coba halaman login
              </Link>
            </div>
            <ol className="space-y-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-gray-900 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Panitia sudah menyiapkan data siswa?</h2>
              <p className="mt-1.5 text-sm text-gray-300">
                Masuk ke dashboard untuk import Excel/CSV, memantau progres, dan mencetak kartu.
              </p>
            </div>
            <Link
              href="/admin"
              className="btn h-11 shrink-0 bg-white px-5 text-gray-900 hover:bg-gray-100"
            >
              <IconUpload className="h-4 w-4" />
              Kelola data
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl justify-center px-4 py-6 text-sm text-gray-500 sm:px-6">
          <a
            href="https://www.3scode.my.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-900 hover:decoration-gray-500 sm:text-base"
          >
            © 2026 TrisnoSanjaya - Sistem Informasi Kunjungan Industri
          </a>
        </div>
      </footer>
    </div>
  );
}
