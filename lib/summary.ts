import type { Period, LedgerEntry, Totals, CategoryTotal, TrendPoint } from "./ledger/types.ts";
import {
  computeTotals,
  computeTaxSetAside,
  filterByPeriod,
  groupByCategory,
  trendSeries,
} from "./ledger/ledger.ts";

export interface Summary {
  period: Period;
  currency: string;
  taxRate: number;
  totals: Totals;
  taxSetAside: number;
  breakdown: CategoryTotal[];
  trend: TrendPoint[];
  monthCount: number;
}

export function buildSummary(
  entries: LedgerEntry[],
  period: Period = "month",
  taxRate = 23,
  currency = "USD",
  now: Date = new Date(),
): Summary {
  const inPeriod = filterByPeriod(entries, period, now);
  return {
    period,
    currency,
    taxRate,
    totals: computeTotals(entries, period, now),
    taxSetAside: computeTaxSetAside(inPeriod, taxRate),
    breakdown: groupByCategory(inPeriod),
    trend: trendSeries(entries, 12, now),
    monthCount: inPeriod.length,
  };
}