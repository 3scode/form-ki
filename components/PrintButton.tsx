"use client";

import { IconPrinter } from "@/components/Icons";

export function PrintButton({
  label = "Cetak",
  className = "btn-primary",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <IconPrinter className="h-4 w-4" />
      {label}
    </button>
  );
}
