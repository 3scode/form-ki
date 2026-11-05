import { headers } from "next/headers";

/**
 * Basis URL absolut untuk isi QR/barcode pada lembar cetak.
 * Di dev memakai host request, di produksi mengikuti proxy (x-forwarded-*).
 */
export async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const proto =
    forwardedProto ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");

  return `${proto}://${host}`;
}
