-- Migrasi: lampiran foto kegiatan boleh lebih dari satu.
-- Jalankan sekali di Supabase Dashboard → SQL Editor pada database yang sudah berisi data.

alter table public.submissions
  add column if not exists photo_urls text[] not null default '{}';

-- Submission lama hanya punya satu foto; salin ke kolom baru.
-- Aplikasi versi tanpa kolom ini menyimpan beberapa URL di photo_url dengan pemisah koma,
-- jadi isinya dipecah dulu per URL.
update public.submissions
set photo_urls = (
  select array_agg(trim(part) order by pos)
  from unnest(string_to_array(photo_url, ',')) with ordinality as t(part, pos)
  where trim(part) <> ''
)
where photo_urls = '{}' and photo_url is not null;
