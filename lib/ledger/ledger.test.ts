import { test } from "node:test";
import assert from "node:assert/strict";
import type { LedgerEntry } from "./types.ts";
import { computeTotals, computeTaxSetAside, groupByCategory, trendSeries } from "./ledger.ts";

function e(
  amountCents: number,
  categoryType: "IN" | "OUT",
  date: string,
  categoryName: string | null = null,
): LedgerEntry {
  return { id: `${date}-${categoryType}-${amountCents}`, amountCents, categoryType, date, categoryName };
}

const FIXED_NOW = new Date(2026, 0, 15); // Jan 15, 2026

const FIXTURES: LedgerEntry[] = [
  e(300000, "IN", "2025-11-03", "Brand Deals"),
  e(40000, "OUT", "2025-11-12", "Software"),
  e(250000, "IN", "2025-12-05", "Brand Deals"),
  e(120000, "OUT", "2025-12-09", "Production"),
  e(320000, "OUT", "2025-12-20", "Camera & Gear"), // December 2025 = LOSS month
  e(500000, "IN", "2026-01-02", "Sponsorships"),
  e(60000, "OUT", "2026-01-04", "Marketing"),
  e(200000, "OUT", "2026-01-15", "Camera & Gear"),
  e(150000, "IN", "2026-02-01", "Ad Revenue"),
  e(45000, "OUT", "2026-02-03", "Shipping"),
];

test("computeTotals: month period counts only the current calendar month", () => {
  const totals = computeTotals(FIXTURES, "month", FIXED_NOW);
  // Jan 2026 only: +500000 -60000 -200000
  assert.deepEqual(totals, { inCents: 500000, outCents: 260000, netCents: 240000, count: 3 });
});

test("computeTotals: quarter period counts the current calendar quarter", () => {
  const totals = computeTotals(FIXTURES, "quarter", FIXED_NOW);
  // Q1 2026 (Jan-Feb): +500000+150000 -60000-200000-45000
  assert.deepEqual(totals, { inCents: 650000, outCents: 305000, netCents: 345000, count: 5 });
});

test("computeTotals: year period counts the current calendar year only", () => {
  const totals = computeTotals(FIXTURES, "year", FIXED_NOW);
  assert.deepEqual(totals, { inCents: 650000, outCents: 305000, netCents: 345000, count: 5 });
});

test("computeTotals: all period counts everything", () => {
  const totals = computeTotals(FIXTURES, "all");
  // IN: 300+250+500+150 = 1,200,000 · OUT: 40+120+320+60+200+45 = 785,000
  assert.deepEqual(totals, { inCents: 1200000, outCents: 785000, netCents: 415000, count: 10 });
});

test("acceptance: a loss month computes a NEGATIVE Net Position", () => {
  const december = FIXTURES.filter((en) => en.date.startsWith("2025-12"));
  const totals = computeTotals(december, "all");
  // IN 250000, OUT 120000+320000=440000 → net -190000
  assert.equal(totals.netCents, -190000);
  assert.ok(totals.netCents < 0, "loss month must be negative");
});

test("computeTaxSetAside: applies the rate to NET POSITIVE only", () => {
  const january = FIXTURES.filter((en) => en.date.startsWith("2026-01"));
  assert.equal(computeTaxSetAside(january, 23), 55200); // 240000 * 0.23
});

test("computeTaxSetAside: rounds to whole cents", () => {
  const netAmount = computeTotals([e(1001, "IN", "2026-01-01")]).netCents;
  const setAside = netAmount * 0.23; // 230.23
  assert.equal(Math.round(setAside), 230);
  assert.equal(computeTaxSetAside([e(1001, "IN", "2026-01-01")], 23), 230);
});

test("acceptance: a loss month sets aside ZERO tax", () => {
  const december = FIXTURES.filter((en) => en.date.startsWith("2025-12"));
  assert.equal(computeTaxSetAside(december, 23), 0);
});

test("groupByCategory: aggregates per category, sorted by absolute total", () => {
  const grouped = groupByCategory(FIXTURES.filter((en) => en.date.startsWith("2026-01")));
  const byName = new Map(grouped.map((g) => [g.categoryName, g]));
  assert.equal(byName.get("Sponsorships")?.totalCents, 500000);
  assert.equal(byName.get("Camera & Gear")?.totalCents, 200000);
  assert.equal(byName.get("Marketing")?.totalCents, 60000);
  assert.equal(grouped[0].categoryName, "Sponsorships");
  assert.ok(
    grouped.every((g, idx) => idx === 0 || Math.abs(grouped[idx - 1].totalCents) >= Math.abs(g.totalCents)),
    "sorted by |total| descending",
  );
});

test("groupByCategory: null category becomes Uncategorized", () => {
  const grouped = groupByCategory([e(5000, "OUT", "2026-01-01")]);
  assert.equal(grouped[0].categoryName, "Uncategorized");
  assert.deepEqual({ ...grouped[0], categoryName: "Uncategorized" }, {
    categoryName: "Uncategorized",
    categoryType: "OUT",
    totalCents: 5000,
    count: 1,
  });
});

test("trendSeries: emits one point per calendar month, oldest → newest", () => {
  const series = trendSeries(FIXTURES, 3, FIXED_NOW);
  assert.equal(series.length, 3);
  assert.deepEqual(series.map((p) => p.month), ["2025-11", "2025-12", "2026-01"]);
});

test("trendSeries: aggregates per month and computes net per point", () => {
  const series = trendSeries(FIXTURES, 3, FIXED_NOW);
  const november = series[0];
  assert.deepEqual(
    { ...november },
    { month: "2025-11", inCents: 300000, outCents: 40000, netCents: 260000 },
  );
  const december = series[1];
  assert.deepEqual(
    { ...december },
    { month: "2025-12", inCents: 250000, outCents: 440000, netCents: -190000 },
  );
  assert.ok(december.netCents < 0, "loss month appears negative in the trend");
  const january = series[2];
  assert.deepEqual(
    { ...january },
    { month: "2026-01", inCents: 500000, outCents: 260000, netCents: 240000 },
  );
});

test("trendSeries: an empty month is a zero point; out-of-window entries are ignored", () => {
  const series = trendSeries(FIXTURES, 4, FIXED_NOW);
  assert.equal(series.length, 4);
  // Oct 2025 has no fixtures → all zeros
  assert.deepEqual(
    { ...series[0] },
    { month: "2025-10", inCents: 0, outCents: 0, netCents: 0 },
  );
});

test("trendSeries: months=0 yields an empty series", () => {
  assert.deepEqual(trendSeries(FIXTURES, 0, FIXED_NOW), []);
});