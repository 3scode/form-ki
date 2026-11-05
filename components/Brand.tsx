import Link from "next/link";

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo.webp"
      alt="Logo SMK Muhammadiyah Kandanghaur"
      width={384}
      height={384}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

export function Brand({
  href = "/",
  subtitle = "Tahun 2026",
}: {
  href?: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <BrandMark />
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-gray-900">Kunjungan Industri</span>
        <span className="block text-[11px] font-medium text-gray-500">{subtitle}</span>
      </span>
    </Link>
  );
}
