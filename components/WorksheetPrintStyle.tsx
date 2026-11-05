/**
 * Aturan cetak khusus lembar kerja.
 *
 * Lembar kerja boleh mengalir ke halaman kedua, jadi margin kertas dipasang
 * lewat `@page` (bukan padding `.worksheet`) agar halaman lanjutan tetap punya
 * margin dan tidak nempel di tepi kertas. Di layar `.worksheet` tetap tampil
 * seperti A4 dengan padding 14 × 16 mm.
 *
 * Halaman cetak kartu kredensial tidak memakai komponen ini, jadi kartu tetap
 * memakai `@page` tanpa margin dari globals.css.
 */
export function WorksheetPrintStyle() {
  return (
    <style>{`@page {
  size: A4 portrait;
  margin: 14mm 16mm;
}

@media print {
  .worksheet {
    width: auto;
    min-height: 0;
    padding: 0;
  }
}`}</style>
  );
}
