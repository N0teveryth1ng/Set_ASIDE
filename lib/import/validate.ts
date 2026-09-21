import { parseEntryInput, type EntryInput } from "../entry-input.ts";
import type { CategoryType } from "../presets.ts";

export type ImportStatus = "ok" | "warning" | "error" | "blank";

export interface ImportFlag {
  field: string;
  message: string;
}

export interface ImportRow {
  index: number;
  sourceLine: number;
  amountCents: number | null;
  date: string | null;
  note: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryType: CategoryType | null;
  status: ImportStatus;
  flags: ImportFlag[];
}

export interface ImportCategory {
  id: string;
  name: string;
  type: CategoryType;
}

export interface ColumnMapping {
  amount: number;
  date: number;
  category: number | null;
  note: number | null;
}

export function parseAmountCell(cell: string): number | null {
  if (!cell) return null;
  let s = cell.replace(/[$\s]/g, "");
  if (s.includes("-")) return null;
  if (!/^[\d,.]+$/.test(s)) return null;

  if (s.includes(",") && s.includes(".")) {
    const groups = s.split(",");
    const head = groups.slice(0, -1);
    const tail = groups[groups.length - 1];
    const headOk = head.every((g, i) => g.length === 3 || (i === 0 && /^\d{1,3}$/.test(g)));
    if (headOk && /^\d+\.\d{1,2}$/.test(tail)) s = s.replace(/,/g, "");
    else return null;
  } else if (s.includes(",")) {
    const groups = s.split(",");
    const last = groups[groups.length - 1];
    s = last.length === 3 ? s.replace(/,/g, "") : s.replace(/,/g, ".");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(Number(s) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  return cents;
}

export function parseDateCell(cell: string): string | null {
  if (!cell) return null;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})([T ].*)?$/.exec(cell);
  let y = 0;
  let mo = 0;
  let d = 0;
  if (match) {
    y = Number(match[1]);
    mo = Number(match[2]);
    d = Number(match[3]);
  } else {
    match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(cell);
    if (match) {
      let m0 = Number(match[1]);
      let d0 = Number(match[2]);
      const y0 = Number(match[3]);
      if (m0 > 12 && d0 <= 12) {
        [m0, d0] = [d0, m0];
      }
      y = y0;
      mo = m0;
      d = d0;
    } else {
      return null;
    }
  }
  const iso = `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return iso;
}

export function prepareImportRows(
  rows: string[][],
  mapping: ColumnMapping,
  skipRows: number,
  categories: ImportCategory[],
): ImportRow[] {
  const byName = new Map<string, ImportCategory>();
  for (const c of categories) byName.set(c.name.toLowerCase(), c);

  const result: ImportRow[] = [];
  for (let i = skipRows; i < rows.length; i += 1) {
    const cells = rows[i];
    const index = i - skipRows;
    const sourceLine = i + 1;
    const cell = (col: number | null): string => (col === null ? "" : (cells[col] ?? ""));
    const raw = cells.join("").trim();

    if (!raw) {
      result.push({
        index,
        sourceLine,
        amountCents: null,
        date: null,
        note: null,
        categoryId: null,
        categoryName: null,
        categoryType: null,
        status: "blank",
        flags: [{ field: "row", message: "Blank row — skipped" }],
      });
      continue;
    }

    const amountCell = cell(mapping.amount);
    const dateCell = cell(mapping.date);
    const categoryCell = cell(mapping.category);
    const noteCell = cell(mapping.note);

    const amountCents = parseAmountCell(amountCell);
    const date = parseDateCell(dateCell);

    let categoryId: string | null = null;
    let categoryName: string | null = null;
    let categoryType: CategoryType | null = null;
    let categoryUnknown = false;
    if (mapping.category !== null && categoryCell) {
      const found = byName.get(categoryCell.toLowerCase());
      if (found) {
        categoryId = found.id;
        categoryName = found.name;
        categoryType = found.type;
      } else {
        categoryUnknown = true;
      }
    }

    const note = noteCell || null;

    const input: EntryInput = {
      amountCents: amountCents ?? Number.NaN,
      // Pass the raw cell through when it didn't parse so parseEntryInput
      // reports the specific reason ("not a real calendar date" vs a plain
      // format violation).
      date: date ?? (dateCell || ""),
      categoryId,
      note,
    };
    const parsed = parseEntryInput(input);

    const flags: ImportFlag[] = [];
    if (!parsed.ok) {
      for (const message of parsed.errors) flags.push({ field: "entry", message });
    }
    if (categoryUnknown) {
      flags.push({
        field: "category",
        message: `"${categoryCell}" is not one of your categories — this row will import as Uncategorized (counts as an expense)`,
      });
    }

    let status: ImportStatus = "ok";
    if (!parsed.ok) status = "error";
    else if (categoryUnknown) status = "warning";

    result.push({
      index,
      sourceLine,
      amountCents: parsed.ok ? parsed.value.amountCents : amountCents,
      date: parsed.ok ? parsed.value.date : date,
      note: parsed.ok ? parsed.value.note : note,
      categoryId: parsed.ok ? parsed.value.categoryId : categoryId,
      categoryName: categoryName ?? (categoryUnknown ? categoryCell : null),
      categoryType: parsed.ok ? (categoryType ?? null) : categoryType,
      status,
      flags,
    });
  }
  return result;
}

export function validateImportInputs(inputs: unknown[]): {
  valid: boolean;
  invalid: { index: number; errors: string[] }[];
} {
  const invalid: { index: number; errors: string[] }[] = [];
  for (let i = 0; i < inputs.length; i += 1) {
    const parsed = parseEntryInput(inputs[i]);
    if (!parsed.ok) invalid.push({ index: i, errors: parsed.errors });
  }
  return { valid: invalid.length === 0, invalid };
}