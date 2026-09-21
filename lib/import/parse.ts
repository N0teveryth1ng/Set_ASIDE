import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedTable {
  fileName: string;
  rows: string[][];
}

function cleanCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\uFEFF/g, "").trim();
}

export function parseCsvTable(content: string, delimiter = ","): string[][] {
  const parsed = Papa.parse<(string | number)[]>(content, {
    delimiter: delimiter || ",",
    skipEmptyLines: false,
  });
  return (parsed.data ?? []).map((row) => row.map(cleanCell));
}

export function parseSheetTable(buffer: ArrayBuffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });
  return rows.map((row) => row.map(cleanCell));
}

export function parseImportFile(
  fileName: string,
  payload: { text?: string; buffer?: ArrayBuffer },
): ParsedTable {
  const extension = fileName.split(".").pop()?.toLowerCase();
  let rows: string[][];
  if (extension === "xlsx" || extension === "xls") {
    rows = parseSheetTable(payload.buffer ?? new ArrayBuffer(0));
  } else {
    rows = parseCsvTable(payload.text ?? "");
  }
  return { fileName, rows };
}