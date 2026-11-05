"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Menjaga isi lembar kerja tetap muat dalam satu halaman A4.
 * Konten diukur, lalu di-zoom turun sedikit bila kepanjangan —
 * lebih baik mengecil daripada tumpah ke halaman kedua.
 */
const MIN_ZOOM = 0.72;

function measureZoom(body: HTMLDivElement, content: HTMLDivElement) {
  const available = body.clientHeight;
  if (!available) return 1;

  const previous = content.style.zoom;
  content.style.zoom = "1";
  const needed = content.scrollHeight;
  content.style.zoom = previous;

  return needed > available ? Math.max(MIN_ZOOM, available / needed) : 1;
}

export function WorksheetFit({ children }: { children: React.ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const fit = useCallback(() => {
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return;
    setZoom(measureZoom(body, content));
  }, []);

  useEffect(() => {
    fit();

    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return;

    // Saat dialog print dibuka, terapkan langsung ke DOM supaya layout
    // cetak sudah benar tanpa menunggu render React.
    const applyForPrint = () => {
      const next = measureZoom(body, content);
      content.style.zoom = next < 1 ? String(next) : "";
      setZoom(next);
    };

    const images = Array.from(content.querySelectorAll("img"));
    const pending = images.filter((image) => !image.complete);
    pending.forEach((image) => image.addEventListener("load", fit));

    window.addEventListener("resize", fit);
    window.addEventListener("beforeprint", applyForPrint);
    void document.fonts?.ready.then(fit);

    return () => {
      pending.forEach((image) => image.removeEventListener("load", fit));
      window.removeEventListener("resize", fit);
      window.removeEventListener("beforeprint", applyForPrint);
    };
  }, [fit]);

  return (
    <div ref={bodyRef} className="worksheet-body">
      <div ref={contentRef} style={zoom < 1 ? { zoom } : undefined}>
        {children}
      </div>
    </div>
  );
}
