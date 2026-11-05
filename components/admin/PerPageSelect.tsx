"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = {
  value: number;
  options: number[];
  defaultValue: number;
};

export function PerPageSelect({ value, options, defaultValue }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function handleChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultValue) params.delete("perPage");
    else params.set("perPage", String(next));
    params.delete("page");
    const search = params.toString();
    startTransition(() => router.push(search ? `/admin?${search}` : "/admin"));
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Tampilkan</span>
      <select
        value={value}
        disabled={pending}
        onChange={(event) => handleChange(Number(event.target.value))}
        aria-label="Jumlah data per halaman"
        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/15 disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-500">per halaman</span>
    </label>
  );
}
