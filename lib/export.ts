export const EXPORT_HEADERS = [
  "date",
  "amount_cents",
  "category",
  "type",
  "note",
  "source",
] as const;

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** ISO date strings are lexicographically sortable; string compare stays inclusive. */
export function isDateISO(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}