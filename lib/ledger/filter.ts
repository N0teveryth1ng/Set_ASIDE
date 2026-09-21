import { embedToCategory } from "./mapping.ts";

/**
 * Drop entries whose category is hidden by the user. Uncategorized entries
 * (no category embed at all) are always kept: they have nothing to hide.
 * Used by the summary path so hiding a category removes it from the
 * breakdown AND reflows the totals/trend over only the visible categories.
 */
export function withoutHiddenCategories<T extends { category?: unknown }>(
  rows: readonly T[],
  hiddenIds: ReadonlySet<string>,
): T[] {
  return rows.filter((row) => {
    const category = embedToCategory(row.category);
    return !(category && hiddenIds.has(category.id));
  });
}