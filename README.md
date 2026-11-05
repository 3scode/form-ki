# Sistem Informasi Kunjungan Industri (KI) 2026

Aplikasi web untuk digitalisasi Lembar Kerja Kunjungan Industri: login siswa (NISN + password atau
QR), form dinamis per jurusan, tracking admin, cetak kartu kredensial, dan cetak lembar kerja A4.

Dibangun dengan **Next.js 16 (App Router, Turbopack)**, **React 19.3**, **Tailwind CSS 4.3**,
**TypeScript 7**, **SheetJS (xlsx) 0.20.3** untuk import Excel, **qrcode.react 4.2** untuk QR Code,
**Supabase (PostgreSQL)** sebagai database, dan **Cloudinary** untuk penyimpanan foto, dengan tema
menyerupai **TailAdmin**.

> `xlsx` dipasang dari CDN resmi SheetJS (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`)
> karena paket `xlsx` di npm berhenti di 0.18.5 dan punya kerentanan (prototype pollution & ReDoS).
> Saat `bun install`, pastikan mesin bisa mengakses `cdn.sheetjs.com`.

## Menjalankan

Butuh **[Bun](https://bun.sh) 1.4+** (semua instalasi, script, dan runtime memakai Bun — tanpa npm).

```bash
bun install
cp .env.example .env.local   # isi kredensial Supabase & Cloudinary
bun run dev
```

Sebelum aplikasi dipakai, buat tabel `students` dan `submissions` dengan menjalankan isi
`supabase/schema.sql` di **Supabase Dashboard → SQL Editor** (sekali saja). Buka
<http://localhost:3000>, login admin, lalu unggah data siswa lewat **Import data**. Database baru
mulai kosong — tidak ada data contoh yang dibuat otomatis.

`bunfig.toml` berisi `[run] bun = true`, jadi `bun run dev`, `bun run build`, dan `bun run start`
semua dijalankan di runtime Bun (setara `bun --bun run ...`). Script lain yang setara:

```bash
bun run build && bun run start   # build produksi
bun install                      # install dependency dari bun.lock
```

### Akun admin

Login admin memakai `ADMIN_EMAIL` / `ADMIN_PASSWORD` dari environment (default
`admin@ki2026.sch.id` / `admin123` bila tidak diset — ganti saat produksi). Akun siswa dibuat dari
import Excel: sistem menghasilkan password 6 digit dan token QR, lalu keduanya bisa dilihat di
**Dashboard admin → Cetak Kartu**.

## Variabel lingkungan

Salin `.env.example` menjadi `.env.local` bila perlu:

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase, dipakai klien server |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) untuk baca/tulis tabel; **jangan** diberi prefix `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Opsional; belum dipakai kode karena akses data hanya dari server |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary (server-only), dipakai signed upload |
| `NEXT_PUBLIC_APP_URL` | URL publik aplikasi, dipakai sebagai isi QR Code (mis. `https://ki2026.sekolah.sch.id`) |
| `ADMIN_EMAIL` | Email login admin (default `admin@ki2026.sch.id`) |
| `ADMIN_PASSWORD` | Password login admin (default `admin123`) |
| `SESSION_SECRET` | Kunci HMAC untuk cookie sesi; **wajib diganti saat produksi** |

QR Code berisi `{NEXT_PUBLIC_APP_URL}/qr/{token}`. Kalau masih berisi `localhost`, QR hanya bisa
dibuka dari komputer yang sama — isi URL publik (atau isi kolom URL di halaman Cetak Kartu) sebelum
mencetak.

## Spesifikasi kartu kredensial

Halaman **Admin → Cetak Kartu** (`/admin/cards`) mencetak kartu dengan spesifikasi:

| Item | Nilai |
| --- | --- |
| Ukuran kartu | **85,6 × 53,98 mm** (ID-1 / standar KTP) |
| Orientasi | Landscape |
| Kertas | A4 portrait (210 × 297 mm) |
| Jumlah per lembar | **2 kolom × 5 baris = 10 kartu** |
| Jarak antar kartu | **12,9 mm** kiri/tengah/kanan · **4,5 mm** antar baris, garis potong putus-putus 0,2 mm |
| QR Code | **±22 mm** |
| Isi kartu | Branding “Kartu Kunjungan Industri 2026”, nama + kelas, NISN, password 6 digit (font mono besar), QR, instruksi “Scan QR atau login memakai NISN + password” |

Perhitungan lembar A4: ruang sisa dibagi rata sehingga **margin kiri = jarak antarkolom = margin
kanan**: `(210 − 2 × 85,6) / 3 = 12,9 mm`. Vertikal: `(297 − 5 × 53,98) / 6 = 4,5 mm` untuk
atas, antarbaris, dan bawah. Grid dipusatkan (`place-content: center`) agar pembulatan piksel
browser tidak memotong kartu kanan. Ukuran lembar dibuat 209,9 × 296,9 mm agar tidak muncul
halaman kosong akibat pembulatan piksel browser.

Saat mencetak: pilih **A4 portrait**, skala **100% / Actual size**, margin **None**, dan aktifkan
**Background graphics**. Filter kelas/jurusan tersedia; kartu ke-11 dan seterusnya otomatis pindah
ke lembar berikutnya.

## Alur fitur

- **Import data** (`/admin/import`): unggah `.xlsx`, `.xls`, atau `.csv` dengan kolom `Nama`, `NISN`,
  `Kelas`, `Jurusan`. Format kelas mengikuti pola `12-FKK-1`. NISN 10 digit; password 6 digit dan
  token QR dibuat otomatis. NISN yang sudah ada akan diperbarui tanpa mengubah password/QR. Template
  Excel bisa diunduh dari halaman ini.
- **Login siswa** (`/login`): NISN + password. **QR** (`/qr/[token]`): modal konfirmasi nama/kelas,
  lalu set sesi dan masuk ke form; tombol “Bukan saya” kembali ke login manual.
- **Form siswa** (`/form`): unggah foto (JPG/PNG/WEBP maks. 8 MB) + pertanyaan sejarah sesuai
  jurusan (BLPT Yogyakarta untuk TKR/TPL/TSM/TKJ/TEI, Merapi Farma Herbal untuk FKK), manfaat, dan
  hasil. Setelah dikirim, status berubah menjadi “Sudah mengisi” dan jawaban terkunci.
- **Dashboard** (`/admin`): kartu statistik, pencarian nama/NISN, filter status/kelas/jurusan,
  pagination, pratinjau foto untuk validasi, dan pemilihan siswa untuk cetak lembar kerja.
- **Cetak lembar kerja** (`/admin/print?ids=...`): satu halaman A4 per siswa berisi identitas,
  pertanyaan + jawaban, foto, dan kolom tanda tangan Wakahumas. Sidebar/header disembunyikan lewat
  CSS `@media print`.

## Catatan implementasi

- Penyimpanan data memakai Supabase (`lib/store.ts` → tabel `students` dan `submissions`, skema di
  `supabase/schema.sql`). Foto siswa diunggah ke Cloudinary lewat `app/api/upload` (signed upload
  dari server, `CLOUDINARY_API_SECRET` tidak pernah dikirim ke browser) dan URL `secure_url`-nya
  disimpan di `submissions.photo_url`.
- Akses database dari server memakai `SUPABASE_SERVICE_ROLE_KEY`, jadi RLS aktif tanpa policy
  publik. Jangan pernah memakai key tersebut di komponen client.
- Login admin tetap memakai `ADMIN_EMAIL` / `ADMIN_PASSWORD` (cookie sesi HMAC), bukan Supabase Auth.
  Tabel `admins` di PRD belum dipakai.
- Autentikasi admin memakai cookie sesi bertanda tangan HMAC (`lib/session.ts`), bukan Supabase Auth.
- Desain kartu sengaja memakai border/teks gelap sehingga tetap terbaca bila opsi “Background
  graphics” dimatikan, meskipun warna latar password akan hilang.
- Seluruh dependency memakai versi stabil terbaru per November 2026 dan audit bersih (0
  kerentanan). Next.js 16 memakai Turbopack secara default untuk `dev` dan `build`.
- Tooling memakai Bun 1.4 (`bun.lock` sebagai lockfile; `package-lock.json` tidak dipakai). Build,
dev server, upload foto, dan import Excel sudah diuji berjalan di runtime Bun.
