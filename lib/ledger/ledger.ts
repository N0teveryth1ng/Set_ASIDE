import type { CategoryTotal, LedgerEntry, Period, Totals, TrendPoint } from "./types.ts";

function monthOf(date: string): { year: number; month: number } {
  const [y, m] = date.split("-").map(Number);
  return { year: y, month: m - 1 };
}

function isWithinPeriod(date: string, period: Period, now: Date): boolean {
  const { year, month } = monthOf(date);
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  switch (period) {
    case "month":
      return year === thisYear && month === thisMonth;
    case "quarter":
      return year === thisYear && Math.floor(month / 3) === Math.floor(thisMonth / 3);
    case "year":
      return year === thisYear;
    case "all":
      return true;
  }
}

export function filterByPeriod(
  entries: LedgerEntry[],
  period: Period,
  now: Date = new Date(),
): LedgerEntry[] {
  return entries.filter((entry) => isWithinPeriod(entry.date, period, now));
}

export function computeTotals(
  entries: LedgerEntry[],
  period: Period = "all",
  now: Date = new Date(),
): Totals {
  let inCents = 0;
  let outCents = 0;
  let count = 0;
  for (const entry of entries) {
    if (!isWithinPeriod(entry.date, period, now)) continue;
    count += 1;
    if (entry.categoryType === "IN") inCents += entry.amountCents;
    else outCents += entry.amountCents;
  }
  return { inCents, outCents, netCents: inCents - outCents, count };
}

/**
 * Tax set-aside for the given set of entries, in integer cents.
 * Applied to the NET POSITIVE amount only: a loss month sets aside zero.
 */
export function computeTaxSetAside(entries: LedgerEntry[], rate: number): number {
  const net = computeTotals(entries).netCents;
  if (net <= 0) return 0;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round((net * rate) / 100);
}

export function groupByCategory(entries: LedgerEntry[]): CategoryTotal[] {
  const bucket = new Map<string, CategoryTotal>();
  for (const entry of entries) {
    const name = entry.categoryName ?? "Uncategorized";
    const current = bucket.get(name);
    if (current) {
      current.totalCents += entry.amountCents;
      current.count += 1;
    } else {
      bucket.set(name, {
        categoryName: name,
        categoryType: entry.categoryType,
        totalCents: entry.amountCents,
        count: 1,
      });
    }
  }
  return [...bucket.values()].sort(
    (a, b) => Math.abs(b.totalCents) - Math.abs(a.totalCents),
  );
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthKeyForOffset(anchor: Date, offset: number): string {
  const d = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function trendSeries(
  entries: LedgerEntry[],
  months: number,
  now: Date = new Date(),
): TrendPoint[] {
  const count = Math.max(0, Math.floor(months));
  const series: TrendPoint[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    series.push({ month: monthKeyForOffset(now, offset), inCents: 0, outCents: 0, netCents: 0 });
  }
  if (count === 0) return series;
  const bucket = new Map<string, TrendPoint>();
  for (const point of series) bucket.set(point.month, point);
  const oldest = series[0].month;
  for (const entry of entries) {
    const key = monthKey(entry.date);
    if (key < oldest) continue;
    const point = bucket.get(key);
    if (!point) continue;
    if (entry.categoryType === "IN") point.inCents += entry.amountCents;
    else point.outCents += entry.amountCents;
    point.netCents = point.inCents - point.outCents;
  }
  return series;
}