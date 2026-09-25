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

const EXCHANGE_SUFFIX = /\b(usd|eur|gbp|cad|aud|chf|jpy|inr)\b/gi;
const CURRENCY_SYMBOLS = /[$€£¥₹]/g;
const MAX_SAMPLE_ROWS = 50;

export interface SignedAmount {
  cents: number;
  negative: boolean;
}

export const FIELD_PATTERNS: Record<FieldKey, RegExp> = {
  amount: /amount|paid|debit|credit|total|invoice|value|revenue|expense|money|entry/i,
  date: /date|day|time|posted|transaction/i,
  category: /category|categor|type|merchant|payee|vendor|project|account/i,
  note: /note|memo|description|detail|reference|comment/i,
};

export type FieldKey = "amount" | "date" | "category" | "note";

/** Shared numeric core: "1,234.56", "19,95" (comma decimal), "1234" → integer cents. */
function centsFromDigits(digits: string): number | null {
  let s = digits;
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

export function parseAmountCellSigned(cell: string): SignedAmount | null {
  if (!cell) return null;
  let s = cell.trim().replace(CURRENCY_SYMBOLS, "").replace(EXCHANGE_SUFFIX, "").trim();
  if (!s) return null;

  let negative = false;
  const paren = /^\((.+)\)$/.exec(s);
  if (paren) {
    negative = true;
    s = paren[1].trim();
  } else if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1).trim();
  } else if (s.endsWith("-")) {
    negative = true;
    s = s.slice(0, -1).trim();
  }

  s = s.replace(/[$\s]/g, "");
  const cents = centsFromDigits(s);
  if (cents === null) return null;
  return { cents, negative };
}

/** Magnitude-only contract: signed or negative-looking cells are rejected. */
export function parseAmountCell(cell: string): number | null {
  const parsed = parseAmountCellSigned(cell);
  if (parsed === null || parsed.negative) return null;
  return parsed.cents;
}

const MONTH_NAMES: Record<string, number> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
  may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
  september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11,
  december: 12, dec: 12,
};

function toISO(y: number, mo: number, d: number): string | null {
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

function yearFromTwoDigits(two: number): number {
  return two >= 50 ? 1900 + two : 2000 + two;
}

const ANSI_DATE =
  /^(\d{4})[-\/.](1[0-2]|0?[1-9])[-\/.](\d{1,2})(?:\s+|\s*T\s*)?\d{0,2}:?\d{0,2}:?\d{0,2}.*$/;
const WRITTEN_MONTH_FIRST = /^([a-z]{3,9})\s+(\d{1,2})\s*,?\s+(\d{2}|\d{4})$/i;
const WRITTEN_DAY_FIRST = /^(\d{1,2})\s+([a-z]{3,9})\s*,?\s+(\d{2}|\d{4})$/i;
const SEPARATOR_DATE = /^(\d{1,2})[^a-z0-9](\d{1,2})[^a-z0-9](\d{2}|\d{4})$/i;

export function parseDateCell(cell: string): string | null {
  if (!cell) return null;
  const s = cell.trim();
  if (!s) return null;

  // Year-first (ISO and friends): 2026-09-15, 2026/9/15, 2026.09.15, with optional time.
  let m = ANSI_DATE.exec(s);
  if (m) return toISO(Number(m[1]), Number(m[2]), Number(m[3]));

  // Written out: "Sep 5, 2025", "05 September 2025", with optional comma and 2-digit years.
  m = WRITTEN_MONTH_FIRST.exec(s);
  if (m) {
    const mo = MONTH_NAMES[m[1].toLowerCase()];
    if (mo) {
      const rawY = m[3];
      const y = rawY.length === 2 ? yearFromTwoDigits(Number(rawY)) : Number(rawY);
      return toISO(y, mo, Number(m[2]));
    }
  }
  m = WRITTEN_DAY_FIRST.exec(s);
  if (m) {
    const mo = MONTH_NAMES[m[2].toLowerCase()];
    if (mo) {
      const rawY = m[3];
      const y = rawY.length === 2 ? yearFromTwoDigits(Number(rawY)) : Number(rawY);
      return toISO(y, mo, Number(m[1]));
    }
  }

  // Separator dates: 9/15/2026 (US, month-first), 31-12-2025 / 31.12.2025 (day-first when day > 12).
  m = SEPARATOR_DATE.exec(s);
  if (m) {
    let a = Number(m[1]);
    let b = Number(m[2]);
    const rawY = m[3];
    const y = rawY.length === 2 ? yearFromTwoDigits(Number(rawY)) : Number(rawY);
    if (a > 12 && b <= 12) [a, b] = [b, a];
    return toISO(y, a, b);
  }

  return null;
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

    const amountParsed = parseAmountCellSigned(amountCell);
    const amountCents = amountParsed ? amountParsed.cents : null;
    const amountNegative = amountParsed ? amountParsed.negative : false;
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
    if (amountNegative) {
      flags.push({
        field: "amount",
        message:
          "Negative amount — imported as its absolute value; the category type decides whether it counts as money in or out",
      });
    }

    let status: ImportStatus = "ok";
    if (!parsed.ok) status = "error";
    else if (categoryUnknown || amountNegative) status = "warning";

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

export interface ImportAutoDetect {
  hasHeader: boolean;
  mapping: ColumnMapping;
}

interface ColumnStats {
  column: number;
  dateRate: number;
  amountRate: number;
  noteRate: number;
  categoryRate: number;
}

interface Sample {
  zero: string[];
  body: string[][];
}

function sampleRows(rows: string[][]): Sample {
  const width = Math.max(1, ...rows.map((r) => r.length));
  const zero = Array.from({ length: width }, (_, i) => rows[0]?.[i] ?? "");
  const body = rows.slice(1, 1 + MAX_SAMPLE_ROWS).map((r) =>
    Array.from({ length: width }, (_, i) => r[i] ?? ""),
  );
  return { zero, body };
}

function columnStats(rows: string[][], categories: ImportCategory[]): ColumnStats[] {
  const { zero, body } = sampleRows(rows);
  const sample = body.length > 0 ? body : zero.length > 0 ? [zero] : [];
  const names = categories.map((c) => c.name.toLowerCase());
  return Array.from({ length: zero.length }, (_, column) => {
    let n = 0;
    let dateOk = 0;
    let amountOk = 0;
    let noteOk = 0;
    let categoryOk = 0;
    for (const r of sample) {
      const v = r[column].trim();
      if (!v) continue;
      n += 1;
      if (parseDateCell(v)) dateOk += 1;
      if (parseAmountCellSigned(v)) amountOk += 1;
      if (!/^[\d,.$€£¥₹()\-/:+ ]+$/.test(v) && v.length > 1) noteOk += 1;
      if (names.some((name) => v.toLowerCase() === name || v.toLowerCase() === name.slice(0, -1))) {
        categoryOk += 1;
      } else if (
        !/^[\d,.$€£¥₹()\-/: ]+$/.test(v) &&
        /\b(income|revenue|inflow|expense|outflow|deposit|withdrawal)\b/i.test(v)
      ) {
        categoryOk += 1;
      }
    }
    const rate = (k: number) => (n === 0 || sample.length === 0 ? 0 : k / n);
    return {
      column,
      dateRate: rate(dateOk),
      amountRate: rate(amountOk),
      noteRate: rate(noteOk),
      categoryRate: rate(categoryOk),
    };
  });
}

function bestBy<T>(items: T[], score: (item: T) => number, min: number): T | null {
  let best: T | null = null;
  let bestScore = min;
  for (const item of items) {
    const v = score(item);
    if (v > bestScore) {
      bestScore = v;
      best = item;
    }
  }
  return best;
}

function headerLookup(zero: string[], key: FieldKey): number {
  return zero.findIndex((h) => FIELD_PATTERNS[key].test(h));
}

function contentMapping(zero: string[], stats: ColumnStats[], categories: ImportCategory[]): ColumnMapping {
  const pickCol = (key: FieldKey, threshold: number, skip: Set<number>): number => {
    const header = headerLookup(zero, key);
    const candidates = stats.filter((s) => !skip.has(s.column));
    const rate = (s: ColumnStats) => s[`${key}Rate` as keyof ColumnStats] as number;
    const content = bestBy(candidates, rate, threshold);
    if (header >= 0 && !skip.has(header) && rate(stats[header]) > 0) return header;
    if (content) return content.column;
    return header;
  };

  const picked = new Set<number>();
  const amount = pickCol("amount", 0.5, picked);
  if (amount >= 0) picked.add(amount);
  const date = pickCol("date", 0.5, picked);
  if (date >= 0) picked.add(date);

  const catHeader = headerLookup(zero, "category");
  const catContent = bestBy(stats.filter((s) => !picked.has(s.column)), (s) => s.categoryRate, 0.15);
  const category = catHeader >= 0 && !picked.has(catHeader) ? catHeader : catContent ? catContent.column : -1;
  if (category >= 0) picked.add(category);

  const noteHeader = headerLookup(zero, "note");
  const noteContent = bestBy(stats.filter((s) => !picked.has(s.column)), (s) => s.noteRate, 0.2);
  const note = noteHeader >= 0 && !picked.has(noteHeader) ? noteHeader : noteContent ? noteContent.column : -1;

  const col = (n: number) => (n >= 0 ? n : null);
  return { amount, date, category: col(category), note: col(note) };
}

export function detectHeaderAndMapping(rows: string[][], categories: ImportCategory[]): ImportAutoDetect {
  if (rows.length === 0) {
    return { hasHeader: false, mapping: { amount: 0, date: 1, category: null, note: null } };
  }
  const { zero } = sampleRows(rows);

  const zeroParsable = zero.filter((v) => Boolean(parseDateCell(v) || parseAmountCellSigned(v))).length;
  const bodyFirstParsable = (rows[1] ?? []).filter((v) =>
    Boolean(parseDateCell(v) || parseAmountCellSigned(v)),
  ).length;
  const looksLikeData = zeroParsable >= 2;
  const keywordHeader = zero.some((v) =>
    (Object.keys(FIELD_PATTERNS) as FieldKey[]).some((k) => FIELD_PATTERNS[k].test(v)),
  );
  const hasHeader =
    rows.length > 1 &&
    !looksLikeData &&
    ((zeroParsable <= 1 && bodyFirstParsable >= 2) || keywordHeader);

  const stats = columnStats(rows, categories);
  const mapping = contentMapping(zero, stats, categories);
  return { hasHeader, mapping };
}