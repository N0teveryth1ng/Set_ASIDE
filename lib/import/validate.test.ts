import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectHeaderAndMapping,
  parseAmountCell,
  parseAmountCellSigned,
  parseDateCell,
  prepareImportRows,
  validateImportInputs,
  type ImportCategory,
} from "./validate.ts";

const CATEGORIES: ImportCategory[] = [
  { id: "c1", name: "Brand Deals", type: "IN" },
  { id: "c2", name: "Software", type: "OUT" },
  { id: "c3", name: "Camera & Gear", type: "OUT" },
];

// Header: Amount, Date, Category, Note
function header() {
  return ["Amount", "Date", "Category", "Note"];
}

const MAP = { amount: 0, date: 1, category: 2, note: 3 };

test("parseAmountCell: plain, thousands separator, currency symbol, and comma-decimal", () => {
  assert.equal(parseAmountCell("1200"), 120000);
  assert.equal(parseAmountCell("1,234.56"), 123456);
  assert.equal(parseAmountCell("$1,234.56"), 123456);
  assert.equal(parseAmountCell("19,95"), 1995); // comma as decimal
  assert.equal(parseAmountCell("75"), 7500);
});

test("parseAmountCell: invalid inputs are rejected (never silently wrong)", () => {
  assert.equal(parseAmountCell("-50"), null);
  assert.equal(parseAmountCell("abc"), null);
  assert.equal(parseAmountCell("12.5.5"), null);
  assert.equal(parseAmountCell("0"), null);
  assert.equal(parseAmountCell("1,2,3.4"), null); // malformed grouping
  assert.equal(parseAmountCell("(1,234.56)"), null); // parens read as a sign
});

test("parseAmountCellSigned: signs, parens, currency symbols, and trailing minus", () => {
  assert.deepEqual(parseAmountCellSigned("1200"), { cents: 120000, negative: false });
  assert.deepEqual(parseAmountCellSigned("$1,234.56"), { cents: 123456, negative: false });
  assert.deepEqual(parseAmountCellSigned("-45.00"), { cents: 4500, negative: true });
  assert.deepEqual(parseAmountCellSigned("50.00-"), { cents: 5000, negative: true });
  assert.deepEqual(parseAmountCellSigned("(12,50)"), { cents: 1250, negative: true });
  assert.deepEqual(parseAmountCellSigned("25,00 EUR"), { cents: 2500, negative: false });
  assert.equal(parseAmountCellSigned("USD"), null);
  assert.equal(parseAmountCellSigned("n/a"), null);
});

test("parseDateCell: European day-first, dot-separated, and year-first variants", () => {
  assert.equal(parseDateCell("31-12-2025"), "2025-12-31");
  assert.equal(parseDateCell("31.12.2025"), "2025-12-31");
  assert.equal(parseDateCell("15/9/2026"), "2026-09-15");
  assert.equal(parseDateCell("13-12-2025"), "2025-12-13"); // day-first only when day > 12
  assert.equal(parseDateCell("2025/09/05"), "2025-09-05");
  assert.equal(parseDateCell("2026.09.15"), "2026-09-15");
  assert.equal(parseDateCell("9/15/26"), "2026-09-15");
  assert.equal(parseDateCell("31-12-84"), "1984-12-31"); // 2-digit year > 50 -> 19xx
});

test("parseDateCell: written-out months", () => {
  assert.equal(parseDateCell("Sep 5, 2025"), "2025-09-05");
  assert.equal(parseDateCell("September 5, 2025"), "2025-09-05");
  assert.equal(parseDateCell("5 Sept 2025"), "2025-09-05");
  assert.equal(parseDateCell("05 December 2025"), "2025-12-05");
  assert.equal(parseDateCell("05 dec 25"), "2025-12-05");
});

test("parseDateCell: ISO, slashed, ISO-with-time, dd/mm swap, and bogus dates", () => {
  assert.equal(parseDateCell("2026-09-15"), "2026-09-15");
  assert.equal(parseDateCell("9/15/2026"), "2026-09-15");
  assert.equal(parseDateCell("2026-09-15 14:30"), "2026-09-15");
  assert.equal(parseDateCell("15/9/2026"), "2026-09-15"); // dd/mm when day > 12
  assert.equal(parseDateCell("2026-02-30"), null); // not a real calendar date
  assert.equal(parseDateCell("tomorrow"), null);
  assert.equal(parseDateCell(""), null);
});

test("prepareImportRows: clean CSV turns every row into a valid import row", () => {
  const rows = [header(), ["1200", "2026-09-15", "Brand Deals", "Client invoice"], ["75", "9/3/2026", "software", ""]];
  const out = prepareImportRows(rows, MAP, 1, CATEGORIES);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0], {
    index: 0,
    sourceLine: 2,
    amountCents: 120000,
    date: "2026-09-15",
    note: "Client invoice",
    categoryId: "c1",
    categoryName: "Brand Deals",
    categoryType: "IN",
    status: "ok",
    flags: [],
  });
  assert.equal(out[1].amountCents, 7500);
  assert.equal(out[1].categoryId, "c2"); // case-insensitive category match
  assert.equal(out[1].status, "ok");
});

test("prepareImportRows: messy CSV flags errors, warnings, and blank rows explicitly", () => {
  const rows = [
    header(),
    ["1200", "2026-09-01", "Brand Deals", "ok row"],
    ["-50", "2026-09-02", "Brand Deals", "negative amount"],
    ["60", "bad-date", "Brand Deals", "bad date"],
    ["90", "2026-09-04", "Merch", "unknown category -> warning"],
    ["", "", "", ""],
    ["abc", "2026-09-06", "Brand Deals", "not a number"],
  ];
  const out = prepareImportRows(rows, MAP, 1, CATEGORIES);
  assert.equal(out.length, 6);
  assert.equal(out[0].status, "ok");
  assert.equal(out[1].status, "warning");
  assert.equal(out[1].amountCents, 5000); // -50 imported as magnitude 5000
  assert.ok(out[1].flags.some((f) => f.message.includes("Negative amount")));
  assert.equal(out[2].status, "error");
  assert.ok(out[2].flags.some((f) => f.message.includes("date")));
  assert.equal(out[3].status, "warning");
  assert.deepEqual(out[3].categoryId, null);
  assert.deepEqual(out[3].categoryType, null);
  assert.equal(out[3].flags.length, 1);
  assert.ok(out[3].flags[0].message.startsWith('"Merch" is not one of your categories'));
  assert.equal(out[4].status, "blank");
  assert.equal(out[4].flags.length, 1);
  assert.equal(out[5].status, "error");
  assert.ok(out[5].flags.some((f) => f.message.includes("positive integer")));
});

test("prepareImportRows: no header row (skipRows = 0) maps by index", () => {
  const rows = [["1200", "2026-09-15", "Brand Deals", ""], ["75", "2026-09-16", "", ""]];
  const out = prepareImportRows(rows, MAP, 0, CATEGORIES);
  assert.equal(out.length, 2);
  assert.equal(out[0].status, "ok");
  assert.equal(out[1].status, "ok");
  assert.deepEqual(out[1].categoryId, null); // empty category cell -> Uncategorized
});

test("prepareImportRows: note longer than 500 chars is an error", () => {
  const rows = [header(), ["1200", "2026-09-15", "Brand Deals", "x".repeat(501)]];
  const out = prepareImportRows(rows, MAP, 1, CATEGORIES);
  assert.equal(out[0].status, "error");
  assert.ok(out[0].flags.some((f) => f.message.includes("500")));
});

test("validateImportInputs: a single invalid input invalidates the batch", () => {
  const good = { amountCents: 500, date: "2026-09-15", categoryId: "c1", note: null };
  assert.deepEqual(validateImportInputs([good, good]), { valid: true, invalid: [] });
  const bad = { amountCents: -500, date: "2026-09-15", categoryId: "c1", note: null };
  const res = validateImportInputs([good, bad, good]);
  assert.equal(res.valid, false);
  assert.equal(res.invalid.length, 1);
  assert.equal(res.invalid[0].index, 1);
});

test("detectHeaderAndMapping: messy headers auto-map by name and content", () => {
  const rows = [
    ["Transaction Date", "Paid (USD)", "Merchant", "Description"],
    ["2026-09-15", "1200.00", "Acme Inc", "Client invoice"],
    ["31-12-2025", "-45.00", "Figma", "Design tool"],
  ];
  const { hasHeader, mapping } = detectHeaderAndMapping(rows, CATEGORIES);
  assert.equal(hasHeader, true);
  assert.equal(mapping.date, 0);
  assert.equal(mapping.amount, 1);
  assert.equal(mapping.category, 2);
  assert.equal(mapping.note, 3);
});

test("detectHeaderAndMapping: headerless file flips to data and maps by content", () => {
  const rows = [
    ["2026-09-15", "1200", "Client invoice"],
    ["2026-09-16", "75", "Coffee"],
    ["05 September 2025", "3200", "Sponsor payment"],
  ];
  const { hasHeader, mapping } = detectHeaderAndMapping(rows, CATEGORIES);
  assert.equal(hasHeader, false);
  assert.equal(mapping.date, 0);
  assert.equal(mapping.amount, 1);
  assert.equal(mapping.note, 2);
});

test("detectHeaderAndMapping: a single data row is never mistaken for a header", () => {
  const rows = [["2026-09-15", "1200", "Client invoice"]];
  const { hasHeader, mapping } = detectHeaderAndMapping(rows, CATEGORIES);
  assert.equal(hasHeader, false);
  assert.equal(mapping.date, 0);
  assert.equal(mapping.amount, 1);
});