import type { CategoryType } from "../presets.ts";

export type EntrySource = "manual" | "import";

export type Period = "month" | "quarter" | "year" | "all";

/**
 * Pure domain view of an entry. Direction is derived from the category type,
 * never stored on the entry. Amounts are integer cents, always positive.
 */
export interface LedgerEntry {
  id: string;
  amountCents: number;
  categoryName: string | null;
  categoryType: CategoryType;
  /** ISO date string, e.g. "2026-09-17" */
  date: string;
  note?: string | null;
}

export interface Totals {
  inCents: number;
  outCents: number;
  netCents: number;
  count: number;
}

export interface CategoryTotal {
  categoryName: string;
  categoryType: CategoryType;
  totalCents: number;
  count: number;
}

export interface TrendPoint {
  month: string;
  inCents: number;
  outCents: number;
  netCents: number;
}