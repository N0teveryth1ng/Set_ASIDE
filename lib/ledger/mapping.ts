import type { LedgerEntry } from "./types.ts";
import type { CategoryType } from "../presets.ts";

export type CategoryEmbed = {
  id: string;
  name: string;
  type: CategoryType;
};

export interface RestEntryRow {
  id: unknown;
  amountCents: unknown;
  date: unknown;
  note: unknown;
  category?: unknown;
}

export function embedToCategory(embed: unknown): CategoryEmbed | null {
  if (!embed || typeof embed !== "object") return null;
  const candidate = Array.isArray(embed) ? (embed[0] ?? null) : embed;
  if (!candidate || typeof candidate !== "object") return null;
  const { id, name, type } = candidate as Partial<CategoryEmbed>;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    (type !== "IN" && type !== "OUT")
  ) {
    return null;
  }
  return { id, name, type };
}

export function toLedgerEntry(row: RestEntryRow): LedgerEntry {
  const category = embedToCategory(row.category);
  return {
    id: String(row.id),
    amountCents: Number(row.amountCents),
    date: String(row.date),
    note: row.note == null ? null : String(row.note),
    categoryName: category?.name ?? "Uncategorized",
    categoryType: category?.type ?? "OUT",
  };
}