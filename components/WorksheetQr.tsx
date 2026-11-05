"use client";

import { QRCodeSVG } from "qrcode.react";

export function WorksheetQr({ value, size = 76 }: { value: string; size?: number }) {
  return (
    <div className="shrink-0 text-center">
      <div className="mx-auto inline-flex rounded border border-gray-300 bg-white p-[1.5mm]">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          marginSize={1}
          bgColor="#ffffff"
          fgColor="#101828"
          className="block"
          title="QR lembar kerja digital"
        />
      </div>
      <p className="mt-1 text-[6.5pt] font-semibold uppercase tracking-[0.12em] text-gray-500">
        Scan lembar digital
      </p>
    </div>
  );
}
