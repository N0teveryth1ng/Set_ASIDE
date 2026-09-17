import { test } from "node:test";
import assert from "node:assert/strict";
import type { LedgerEntry } from "./ledger/types.ts";
import { buildSummary } from "./summary.ts";

function e(
  amountCents: number,
  categoryType: "IN" | "OUT",
  date: string,
  categoryName: string | null = null,
): LedgerEntry {
  return { id: `${date}-${categoryType}-${amountCents}`, amountCents, categoryType, date, categoryName };
}

const FIXED_NOW = new Date(2026, 8, 17); // Sep 17, 2026

// Sep 2026: +420000 -180000 = +240000
// Aug 2026: +50000
// Dec 2025: -900000
const FIXTURES: LedgerEntry[] = [
  e(420000, "IN", "2026-09-15", "Brand Deals"),
  e(180000, "OUT", "2026-09-16", "Software"),
  e(50000, "IN", "2026-08-03", "Sponsorships"),
  e(900000, "OUT", "2025-12-05", "Camera & Gear"),
];

test("buildSummary: month — totals and period-aware tax set-aside", () => {
  const s = buildSummary(FIXTURES, "month", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 420000, outCents: 180000, netCents: 240000, count: 2 });
  assert.equal(s.taxSetAside, 55200); // 240000 * 0.23, rounded to whole cents
  assert.equal(s.monthCount, 2);
  assert.equal(s.period, "month");
});

test("buildSummary: quarter — current quarter (Jul-Sep) sums Aug+Sep", () => {
  const s = buildSummary(FIXTURES, "quarter", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 470000, outCents: 180000, netCents: 290000, count: 3 });
  assert.equal(s.monthCount, 3);
});

test("buildSummary: year — same year (2026) is Aug+Sep", () => {
  const s = buildSummary(FIXTURES, "year", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 470000, outCents: 180000, netCents: 290000, count: 3 });
});

test("buildSummary: all — loss month included, tax set-aside is zero", () => {
  const s = buildSummary(FIXTURES, "all", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 470000, outCents: 1080000, netCents: -610000, count: 4 });
  assert.equal(s.taxSetAside, 0); // computeTaxSetAside rule: net <= 0 => 0
  assert.equal(s.monthCount, 4);
});

test("buildSummary: breakdown scoped to the selected period", () => {
  const month = buildSummary(FIXTURES, "month", 23, "USD", FIXED_NOW);
  assert.deepEqual(month.breakdown, [
    { categoryName: "Brand Deals", categoryType: "IN", totalCents: 420000, count: 1 },
    { categoryName: "Software", categoryType: "OUT", totalCents: 180000, count: 1 },
  ]);
  const all = buildSummary(FIXTURES, "all", 23, "USD", FIXED_NOW);
  assert.equal(all.breakdown.length, 4);
});

test("buildSummary: trend is the trailing 12 months regardless of period, ending at current month", () => {
  const s = buildSummary(FIXTURES, "month", 23, "USD", FIXED_NOW);
  assert.equal(s.trend.length, 12);
  assert.equal(s.trend[11].month, "2026-09");
  assert.deepEqual({ ...s.trend[11] }, { month: "2026-09", inCents: 420000, outCents: 180000, netCents: 240000 });
  assert.deepEqual(s.trend[10], { month: "2026-08", inCents: 50000, outCents: 0, netCents: 50000 });
  assert.deepEqual(s.trend[2], { month: "2025-12", inCents: 0, outCents: 900000, netCents: -900000 });
  assert.deepEqual(s.trend[0], { month: "2025-10", inCents: 0, outCents: 0, netCents: 0 });
});

test("buildSummary: empty ledger yields a zero month summary with empty breakdown", () => {
  const s = buildSummary([], "month", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 0, outCents: 0, netCents: 0, count: 0 });
  assert.equal(s.taxSetAside, 0);
  assert.deepEqual(s.breakdown, []);
});

test("buildSummary: uncategorized entries count as OUT (D-015)", () => {
  const fixtures = [e(7777, "OUT", "2026-09-14", null), e(10000, "IN", "2026-09-10", "Brand Deals")];
  const s = buildSummary(fixtures, "month", 23, "USD", FIXED_NOW);
  assert.deepEqual(s.totals, { inCents: 10000, outCents: 7777, netCents: 2223, count: 2 });
  assert.deepEqual(s.breakdown, [
    { categoryName: "Brand Deals", categoryType: "IN", totalCents: 10000, count: 1 },
    { categoryName: "Uncategorized", categoryType: "OUT", totalCents: 7777, count: 1 },
  ]);
});