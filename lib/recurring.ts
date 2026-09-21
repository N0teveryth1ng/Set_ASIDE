// Set-Aside — recurring entry engine
// A recurring entry is defined by a Template: an amount, a category, a
// day-of-month and a date range. `occurrenceDates` expands a template into the
// concrete entry dates within a range; month overflow days clamp to the last
// day of that month (Jan 31 -> Feb 28, never Feb 31).

export interface RecurringTemplateInput {
  amountCents: number;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  note: string | null;
  categoryId: string | null;
  active: boolean;
}

export type ParseResult =
  | { ok: true; value: RecurringTemplateInput }
  | { ok: false; errors: string[] };

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d
  );
}

// "YYYY-MM-01" + day -> the real calendar day, clamped to the last day of month.
export function clampDayInMonth(monthPrefix: string, day: number): string {
  const [y, mo] = monthPrefix.split("-").map(Number);
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const d = Math.min(day, Math.max(1, last));
  return `${monthPrefix}-${String(d).padStart(2, "0")}`;
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthsBetween(from: string, through: string): string[] {
  const [fy, fmo] = from.split("-").map(Number);
  const [ty, tmo] = through.split("-").map(Number);
  const out: string[] = [];
  let y = fy;
  let mo = fmo;
  while (y < ty || (y === ty && mo <= tmo)) {
    out.push(`${y}-${String(mo).padStart(2, "0")}`);
    mo += 1;
    if (mo > 12) {
      mo = 1;
      y += 1;
    }
    if (out.length > 1200) break; // safety: ~100 years of months max
  }
  return out;
}

export interface TemplateSchedule {
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
}

// Expands a template into occurrences between `from` and `through` (inclusive).
// A month is skipped when its clamped occurrence lands before `startDate` or
// after `endDate` (used for the boundary months of a range).
export function occurrenceDates(
  schedule: TemplateSchedule,
  from: string,
  through: string,
): string[] {
  const effectiveFrom = from < schedule.startDate ? schedule.startDate : from;
  if (effectiveFrom > through) return [];
  const out: string[] = [];
  for (const prefix of monthsBetween(effectiveFrom, through)) {
    const candidate = clampDayInMonth(prefix, schedule.dayOfMonth);
    if (candidate < schedule.startDate) continue;
    if (schedule.endDate !== null && candidate > schedule.endDate) continue;
    out.push(candidate);
  }
  return out;
}

function parseDateField(value: unknown, field: string, errors: string[]): string | null {
  if (typeof value !== "string") {
    errors.push(`${field} must be YYYY-MM-DD`);
    return null;
  }
  if (!DATE_RE.test(value)) {
    errors.push(`${field} must be YYYY-MM-DD`);
    return null;
  }
  if (!isRealDate(value)) {
    errors.push(`${field} is not a real calendar date: ${value}`);
    return null;
  }
  return value;
}

function parseNullableText(value: unknown, max: number, field: string, errors: string[]): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    errors.push(`${field} must be a string`);
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    errors.push(`${field} must be ${max} characters or fewer`);
    return null;
  }
  return trimmed.length > 0 ? trimmed : null;
}

function parseCategoryId(value: unknown, errors: string[]): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || value.length === 0) {
    errors.push("categoryId must be a string or null");
    return null;
  }
  return value;
}

// Full validation for create. Returns every field validated together so the
// start/end relationship is checked at once.
export function parseTemplateInput(raw: unknown): ParseResult {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["Body must be a JSON object"] };
  }
  const body = raw as Record<string, unknown>;
  const errors: string[] = [];

  const amount = body.amountCents;
  if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
    errors.push("amountCents must be a positive integer (amounts are whole cents)");
  }

  const day = body.dayOfMonth;
  if (
    typeof day !== "number" ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31
  ) {
    errors.push("dayOfMonth must be an integer between 1 and 31");
  }

  const startDate = parseDateField(body.startDate, "startDate", errors);
  const endDate =
    body.endDate === null || body.endDate === undefined
      ? null
      : parseDateField(body.endDate, "endDate", errors);

  if (startDate && endDate && endDate < startDate) {
    errors.push("endDate must be on or after startDate");
  }

  const note = parseNullableText(body.note, 500, "note", errors);
  const categoryId = parseCategoryId(body.categoryId, errors);

  let active = true;
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      errors.push("active must be a boolean");
    } else {
      active = body.active;
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      amountCents: amount as number,
      dayOfMonth: day as number,
      startDate: startDate as string,
      endDate,
      note,
      categoryId,
      active,
    },
  };
}

// Per-field validation for partial PATCH. `fields` only contains keys present
// in the body; cross-field start/end consistency is left to the caller once the
// merged row is known.
export function parseTemplatePatch(
  raw: unknown,
): { ok: true; fields: Partial<RecurringTemplateInput> } | { ok: false; errors: string[] } {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["Body must be a JSON object"] };
  }
  const body = raw as Record<string, unknown>;
  const errors: string[] = [];
  const fields: Partial<RecurringTemplateInput> = {};

  if ("amountCents" in body) {
    const amount = body.amountCents;
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
      errors.push("amountCents must be a positive integer (amounts are whole cents)");
    } else {
      fields.amountCents = amount;
    }
  }

  if ("dayOfMonth" in body) {
    const day = body.dayOfMonth;
    if (typeof day !== "number" || !Number.isInteger(day) || day < 1 || day > 31) {
      errors.push("dayOfMonth must be an integer between 1 and 31");
    } else {
      fields.dayOfMonth = day;
    }
  }

  if ("startDate" in body) {
    const parsed = parseDateField(body.startDate, "startDate", errors);
    if (parsed) fields.startDate = parsed;
  }

  if ("endDate" in body) {
    if (body.endDate === null || body.endDate === undefined) {
      fields.endDate = null;
    } else {
      const parsed = parseDateField(body.endDate, "endDate", errors);
      if (parsed) fields.endDate = parsed;
    }
  }

  if ("note" in body) {
    fields.note = parseNullableText(body.note, 500, "note", errors);
  }

  if ("categoryId" in body) {
    fields.categoryId = parseCategoryId(body.categoryId, errors);
  }

  if ("active" in body) {
    if (typeof body.active !== "boolean") {
      errors.push("active must be a boolean");
    } else {
      fields.active = body.active;
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, fields };
}