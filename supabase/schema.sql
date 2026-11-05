-- Skema Supabase untuk Sistem Informasi KI 2026.
-- Jalankan sekali di Supabase Dashboard → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nisn varchar(10) not null unique,
  name varchar(150) not null,
  class varchar(50) not null,
  major varchar(10) not null check (major in ('TKR', 'TPL', 'TSM', 'TKJ', 'TEI', 'FKK')),
  password varchar(6) not null,
  login_token varchar(64) not null unique,
  is_submitted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students (id) on delete cascade,
  photo_url text not null,
  -- Semua foto kegiatan; photo_url di atas tetap diisi foto pertama.
  photo_urls text[] not null default '{}',
  answer_history text not null,
  answer_benefit text not null,
  answer_result text not null,
  created_at timestamptz not null default now()
);

create index if not exists students_class_idx on public.students (class);
create index if not exists students_major_idx on public.students (major);
create index if not exists students_login_token_idx on public.students (login_token);
create index if not exists submissions_student_idx on public.submissions (student_id);

-- Aplikasi mengakses tabel hanya dari server memakai service_role key,
-- jadi RLS dinyalakan tanpa policy publik.
alter table public.students enable row level security;
alter table public.submissions enable row level security;
