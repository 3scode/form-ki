"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconLogout } from "@/components/Icons";

type Props = {
  endpoint: string;
  redirectTo: string;
  label?: string;
  className?: string;
};

export function LogoutButton({ endpoint, redirectTo, label = "Keluar", className = "" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch(endpoint, { method: "POST" });
    } finally {
      router.replace(redirectTo);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60 ${className}`}
    >
      <IconLogout className="h-4 w-4" />
      {loading ? "Keluar..." : label}
    </button>
  );
}
