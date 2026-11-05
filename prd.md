# Product Requirements Document (PRD)

**Project Name:** Sistem Informasi Form Kunjungan Industri (KI) 2026
**Document Version:** 1.2
**Date:** November 2026

## 1. Project Overview

Aplikasi berbasis web untuk digitalisasi pengisian Lembar Kerja Kunjungan Industri bagi siswa/siswi. Sistem ini mempermudah proses autentikasi (menggunakan kredensial otomatis atau QR Code), pengisian form yang dinamis berdasarkan jurusan, serta memudahkan admin (sekolah) untuk melacak status pengisian dan mencetak lembar kerja secara masal.

## 2. Tech Stack

* **Framework Frontend/Backend:** Next.js (App Router)
* **Styling & UI Theme:** Tailwind CSS, **TailAdmin** (Dashboard Template & UI Components)
* **Database & Auth (Admin):** Supabase (PostgreSQL)
* **Image Hosting:** Cloudinary (Untuk optimasi dan storage foto)
* **Deployment & Hosting:** Vercel
* **Print Tools:** CSS `@media print` / `react-to-print`
* **QR Code Generator:** `qrcode.react` (atau sejenisnya)

## 3. UI/UX & Design Theme Guidelines (TailAdmin)

Seluruh antarmuka aplikasi, baik untuk sisi Admin maupun Siswa, **WAJIB** menggunakan referensi dan komponen dari **TailAdmin** ([https://tailadmin.com/](https://tailadmin.com/)) guna menjaga konsistensi, kecepatan pengembangan, dan standar visual yang profesional.

* **Admin Dashboard:** 
  * Menggunakan struktur layout *default* TailAdmin (Sidebar Navigation, Top Header, dan Main Content Area).
  * Data master siswa dan *tracking* form menggunakan komponen **Data Tables** bawaan TailAdmin lengkap dengan pagination, search, dan fitur filter.
  * *Card layout* digunakan untuk menampilkan rangkuman (jumlah siswa sudah/belum mengisi).
* **Student View (Mobile-First):** 
  * Halaman Login dan Form Pengisian bagi siswa akan memanfaatkan *Form Elements* (input text, text area, file upload) dan *Buttons* dari TailAdmin agar *look & feel*-nya konsisten dengan halaman admin.
  * Desain difokuskan pada **Mobile-First Approach** karena siswa mayoritas akan mengakses form dan scan QR Code menggunakan HP.
* **Komponen Interaktif:** Modal/Pop-up (untuk konfirmasi validasi QR Code), *Alerts*, dan *Toasts* notifikasi sepenuhnya menggunakan *library component* dari TailAdmin.

## 4. User Roles

1. **Siswa:** Pengguna yang bertugas login, memvalidasi data diri, mengunggah foto, dan mengisi form pertanyaan.
2. **Admin (Wakahumas/Panitia):** Pengguna yang mengelola data master, memantau progress pengisian, memvalidasi foto secara manual, dan mencetak laporan/lembar kerja.

## 5. Key Features & Requirements

### 5.1. Manajemen Data & Kredensial (Admin)

* **Upload Data Master:** Admin dapat mengunggah file Excel/CSV berisi master data siswa. Kolom yang dibutuhkan: `Nama`, `NISN`, `Kelas`, `Jurusan`.
* **Auto-Generate Password:** Saat data diunggah, sistem otomatis membuat *password* berupa 6 digit angka random untuk setiap siswa.
* **Generate QR Code:** Sistem membuat URL unik (berisi token/kredensial) yang di-encode menjadi QR Code untuk tiap siswa.
* **Print Kredensial:** Admin dapat mencetak daftar kredensial (NISN, Password, dan QR Code) untuk didistribusikan ke siswa. Bisa difilter per kelas atau jurusan.

### 5.2. Autentikasi Siswa

* **Metode 1: Manual Login.** Siswa memasukkan NISN dan 6 digit password di halaman login.
* **Metode 2: QR Code Scan (Auto-Login).**
  * Siswa melakukan scan QR Code dari kertas kredensial menggunakan HP.
  * Sistem membuka URL unik, lalu memunculkan **Pop-up Validasi** (menggunakan komponen Modal TailAdmin).
  * *Konten Pop-up:* "Konfirmasi Data: Apakah benar ini Anda? Nama: \[Nama Siswa\], Kelas: \[Kelas\]".
  * *Action:*
    * Tombol "Ya, Lanjutkan" -> Set session login, *redirect* ke Form.
    * Tombol "Bukan Saya" -> Batalkan login, *redirect* ke halaman login manual.

### 5.3. Form Kunjungan Industri (Siswa)

Setelah login berhasil, sistem mendeteksi `Jurusan` siswa dan menampilkan form yang sesuai:

1. **Upload Foto:** Input file (kamera/galeri) wajib berisi foto diri sendiri saat kunjungan. Foto langsung diunggah ke **Cloudinary** (mendapatkan return URL).
2. **Pertanyaan Dinamis (Sejarah):**
   * Jika jurusan = TKR, TPL, TSM, TKJ, atau TEI: *Tuliskan secara ringkas sejarah BLPT Yogyakarta.*
   * Jika jurusan = FKK: *Tuliskan secara ringkas sejarah Merapi Farma Herbal.*
3. **Pertanyaan Umum 1:** *Manfaat kegiatan kunjungan industri.*
4. **Pertanyaan Umum 2:** *Hasil dari kegiatan kunjungan industri.*
* **Submission:** Setelah form di-submit, status siswa berubah menjadi "Sudah Mengisi".

### 5.4. Dashboard Admin & Tracking

* **Data Table (TailAdmin):** Menampilkan daftar seluruh siswa beserta statusnya (Sudah Mengisi / Belum Mengisi).
* **Filter System:** Admin dapat menyaring data berdasarkan:
  * Status Pengisian
  * Kelas
  * Jurusan
* **Manual Validation:** Admin dapat melihat foto yang diunggah tiap siswa untuk memastikan keaslian foto diri.

### 5.5. Fitur Print Lembar Kerja (Admin Only)

* Admin dapat memilih siswa yang sudah mengisi (bisa massal dengan filter kelas/jurusan), lalu klik tombol "Print Lembar Kerja".
* Sistem akan me-render format cetak A4 tanpa elemen UI *website* (hanya konten lembar kerja, menyembunyikan sidebar/header TailAdmin).
* **Format Layout Print:**
  * *Heading:* Lembar Kerja Kunjungan Industri 2026
  * *Nama:* \[Nama Siswa\]
  * *Kelas:* \[Kelas Siswa\]
  * *Pertanyaan & Jawaban:* (Sejarah, Manfaat, Hasil)
  * *Lampiran:* Foto yang diunggah siswa (diambil dari URL Cloudinary).
  * *Footer:* Tanda Tangan Wakahumas (beserta *space* kosong).

## 6. Database Schema (Draft - Supabase)

**Table: `students`**
* `id` (uuid, PK)
* `nisn` (varchar, unique)
* `name` (varchar)
* `class` (varchar)
* `major` (varchar) - *TKR, TPL, TSM, TKJ, TEI, FKK*
* `password` (varchar) - *6 digit random*
* `login_token` (varchar) - *Untuk keperluan QR Code URL*
* `is_submitted` (boolean, default: false)

**Table: `submissions`**
* `id` (uuid, PK)
* `student_id` (uuid, FK to students.id)
* `photo_url` (text) - *URL dari Cloudinary*
* `answer_history` (text)
* `answer_benefit` (text)
* `answer_result` (text)
* `created_at` (timestamp)

**Table: `admins`**
* `id` (uuid, PK)
* `email` (varchar)
* `password` (hashed)

## 7. Development Phases (Action Plan)

1. **Setup & Integrasi:** Inisiasi Next.js, instalasi dan konfigurasi **TailAdmin**, koneksi ke Supabase, integrasi Cloudinary SDK.
2. **Backend & Admin Auth:** Setup Supabase auth untuk admin, API endpoint upload data Excel, dan *logic generate* NISN/Password/Token.
3. **Admin UI (Part 1):** Penyesuaian layout *Dashboard*, tabel *tracking*, fitur upload file, dan fitur *print* kredensial + QR Code menggunakan komponen **TailAdmin**.
4. **Student Flow:** Bikin UI Login manual & URL QR *Scanner logic* + *Pop-up Validation* (menggunakan komponen Modal **TailAdmin**).
5. **Form Page:** Bikin halaman input form dengan style UI **TailAdmin**, integrasi Cloudinary *upload widget*, *logic render* soal sesuai jurusan.
6. **Admin UI (Part 2):** Bikin fitur *Print Lembar Kerja* A4 dengan CSS print.
7. **Testing & Deployment:** Push ke Vercel, *testing end-to-end* di berbagai *device* (terutama HP).