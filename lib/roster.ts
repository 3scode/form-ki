import * as XLSX from "xlsx";
import { MAJORS, MAJOR_LABELS, type Major } from "./types";

export type RosterRow = {
  name: string;
  nisn: string;
  className: string;
  major: string;
};

export type ParsedRoster = {
  rows: RosterRow[];
  sheetName: string;
};

const HEADER_ALIASES = {
  name: ["nama", "namasiswa", "name", "namalengkap"],
  nisn: ["nisn", "nomorinduk", "noinduk", "nomorinduknasional"],
  className: ["kelas", "class", "rombel", "rombelkelas"],
  major: ["jurusan", "major", "kompetensikeahlian", "konsentrasikeahlian"],
} as const;

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const MAJOR_ALIASES: Record<string, Major> = {
  TKR: "TKR",
  TEKNIKKENDARAANRINGAN: "TKR",
  OTOMOTIF: "TKR",
  TPL: "TPL",
  TEKNIKPENGELASAN: "TPL",
  PENGELASAN: "TPL",
  TSM: "TSM",
  TEKNIKSEPEDAMOTOR: "TSM",
  TKJ: "TKJ",
  TEKNIKKOMPUTERJARINGAN: "TKJ",
  TJKT: "TKJ",
  TEI: "TEI",
  TEKNIKELEKTRONIKAINDUSTRI: "TEI",
  ELEKTRONIKAINDUSTRI: "TEI",
  FKK: "FKK",
  FARMASIKLINISKOMUNITAS: "FKK",
  FARMASI: "FKK",
};

export function normalizeMajor(value: string): Major | null {
  const key = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return MAJOR_ALIASES[key] ?? null;
}

function matrixFromFile(buffer: Buffer, filename: string): { matrix: unknown[][]; sheetName: string } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File Excel tidak memiliki sheet.");
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
  return { matrix, sheetName };
}

export function parseRoster(buffer: Buffer, filename: string): ParsedRoster {
  const { matrix, sheetName } = matrixFromFile(buffer, filename);
  if (matrix.length === 0) throw new Error("File kosong.");

  const headerIndex = matrix.findIndex((row) =>
    row.some((cell) => normalizeHeader(String(cell ?? "")) === "nisn"),
  );
  if (headerIndex === -1) {
    throw new Error(
      "Baris judul tidak ditemukan. Pastikan file memiliki kolom Nama, NISN, Kelas, dan Jurusan.",
    );
  }

  const header = matrix[headerIndex].map((cell) => normalizeHeader(String(cell ?? "")));
  const column = (aliases: readonly string[]) => header.findIndex((item) => aliases.includes(item));

  const nameIndex = column(HEADER_ALIASES.name);
  const nisnIndex = column(HEADER_ALIASES.nisn);
  const classIndex = column(HEADER_ALIASES.className);
  const majorIndex = column(HEADER_ALIASES.major);

  if (nisnIndex === -1) throw new Error("Kolom NISN tidak ditemukan.");
  if (nameIndex === -1) throw new Error("Kolom Nama tidak ditemukan.");

  const rows: RosterRow[] = [];
  for (const raw of matrix.slice(headerIndex + 1)) {
    const value = (index: number) =>
      index === -1 ? "" : String(raw[index] ?? "").replace(/\s+/g, " ").trim();
    const nisn = value(nisnIndex).replace(/\D/g, "");
    const name = value(nameIndex);
    if (!nisn && !name) continue;
    rows.push({
      name,
      nisn,
      className: value(classIndex),
      major: value(majorIndex).toUpperCase(),
    });
  }

  if (rows.length === 0) throw new Error("Tidak ada baris data siswa di dalam file.");
  return { rows, sheetName };
}

export const ROSTER_HEADER = ["Nama", "NISN", "Kelas", "Jurusan"];
export const MAJOR_LIST = MAJORS.map((m) => MAJOR_LABELS[m]).join(", ");
