import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmountCell, parseDateCell, prepareImportRows, validateImportInputs, type ImportCategory } from "./validate.ts";

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
  assert.equal(out[1].status, "error");
  assert.ok(out[1].flags.some((f) => f.message.includes("positive integer")));
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