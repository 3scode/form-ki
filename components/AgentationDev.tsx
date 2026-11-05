"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

/**
 * Agentation hanya dimuat di mode development, dan baru diimpor saat
 * komponen ini benar-benar dirender — jadi bundel produksi tidak ikut
 * membawa toolbar feedback.
 */
export function AgentationDev() {
  const [Toolbar, setToolbar] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;

    void import("agentation").then((mod) => {
      if (!cancelled) setToolbar(() => mod.Agentation);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return Toolbar ? <Toolbar /> : null;
}
