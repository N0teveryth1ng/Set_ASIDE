export interface EntryInput {
  amountCents: number;
  date: string;
  note: string | null;
  categoryId: string | null;
}

export type EntryInputResult =
  | { ok: true; value: EntryInput }
  | { ok: false; errors: string[] };

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseEntryInput(raw: unknown): EntryInputResult {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["Body must be a JSON object"] };
  }
  const body = raw as Record<string, unknown>;
  const errors: string[] = [];

  const amount = body.amountCents;
  if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
    errors.push("amountCents must be a positive integer (amounts are whole cents)");
  }

  const date = body.date;
  if (typeof date !== "string") {
    errors.push("date is required (YYYY-MM-DD)");
  } else {
    const m = DATE_RE.exec(date);
    if (!m) {
      errors.push("date must be YYYY-MM-DD");
    } else {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const dt = new Date(Date.UTC(y, mo - 1, d));
      const valid =
        dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
      if (!valid) errors.push(`date is not a real calendar date: ${date}`);
    }
  }

  let categoryId: string | null = null;
  if (body.categoryId !== null && body.categoryId !== undefined) {
    if (typeof body.categoryId !== "string" || body.categoryId.length === 0) {
      errors.push("categoryId must be a string or null");
    } else {
      categoryId = body.categoryId;
    }
  }

  let note: string | null = null;
  if (body.note !== null && body.note !== undefined) {
    if (typeof body.note !== "string") {
      errors.push("note must be a string");
    } else {
      const trimmed = body.note.trim();
      if (trimmed.length > 500) errors.push("note must be 500 characters or fewer");
      else note = trimmed.length > 0 ? trimmed : null;
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { amountCents: amount as number, date: date as string, categoryId, note } };
}