import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsv, EXPORT_HEADERS, isDateISO } from "./export.ts";

test("buildCsv: headers + plain rows", () => {
  const csv = buildCsv(EXPORT_HEADERS, [["2026-09-01", "120000", "Brand Deals", "IN", "", "manual"]]);
  assert.equal(
    csv,
    "date,amount_cents,category,type,note,source\r\n2026-09-01,120000,Brand Deals,IN,,manual\r\n",
  );
});

test("buildCsv: quotes cells containing commas, quotes, and newlines", () => {
  const csv = buildCsv(["date", "note"], [["2026-09-01", 'say "hi", then go']]);
  assert.equal(csv, 'date,note\r\n2026-09-01,"say ""hi"", then go"\r\n');
});

test("buildCsv: multiline note stays inside one quoted cell", () => {
  const csv = buildCsv(["note"], [["line1\nline2"]]);
  assert.equal(csv, 'note\r\n"line1\nline2"\r\n');
});

test("buildCsv: round-trips through no escaping needed for plain text", () => {
  const csv = buildCsv(["a"], [["plain"]]);
  assert.equal(csv, "a\r\nplain\r\n");
});

test("isDateISO: accepts YYYY-MM-DD only", () => {
  assert.equal(isDateISO("2026-09-01"), true);
  assert.equal(isDateISO("2026-9-1"), false);
  assert.equal(isDateISO("2026-09-01T00:00:00"), false);
  assert.equal(isDateISO("yesterday"), false);
  assert.equal(isDateISO(null), false);
  assert.equal(isDateISO(20260901), false);
});