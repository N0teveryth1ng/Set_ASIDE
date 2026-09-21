export const CARD_TOKENS = ["hero", "money", "tax", "breakdown", "trend"] as const;
export type CardToken = (typeof CARD_TOKENS)[number];

export const DEFAULT_CARDS: readonly CardToken[] = [
  "hero",
  "money",
  "tax",
  "breakdown",
  "trend",
];

export const CARD_LABELS: Record<CardToken, string> = {
  hero: "Net position",
  money: "Money in / out",
  tax: "Tax set-aside",
  breakdown: "Breakdown by category",
  trend: "Monthly trend",
};

export const ALLOWED_CURRENCIES: readonly string[] = ["USD"];

export type NormalizeResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function normalizeCards(input: unknown): NormalizeResult<readonly CardToken[]> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "cards must be a non-empty array" };
  }
  if (input.length > CARD_TOKENS.length) {
    return { ok: false, error: `cards may contain at most ${CARD_TOKENS.length} sections` };
  }
  const seen = new Set<CardToken>();
  for (const raw of input) {
    const token = CARD_TOKENS.find((t) => t === raw);
    if (!token) {
      return { ok: false, error: `unknown card token: ${String(raw)}` };
    }
    if (seen.has(token)) {
      return { ok: false, error: `duplicate card token: ${token}` };
    }
    seen.add(token);
  }
  return { ok: true, value: input as readonly CardToken[] };
}

export function normalizeTaxRate(input: unknown): NormalizeResult<number> {
  if (
    typeof input !== "number" ||
    !Number.isFinite(input) ||
    input < 0 ||
    input > 100
  ) {
    return { ok: false, error: "taxRate must be a number between 0 and 100" };
  }
  return { ok: true, value: input };
}

export function normalizeCurrency(input: unknown): NormalizeResult<string> {
  if (typeof input !== "string" || !ALLOWED_CURRENCIES.includes(input)) {
    return {
      ok: false,
      error: `currencyDisplay must be one of: ${ALLOWED_CURRENCIES.join(", ")}`,
    };
  }
  return { ok: true, value: input };
}

export function normalizeCategoryName(input: unknown): NormalizeResult<string> {
  if (typeof input !== "string") {
    return { ok: false, error: "name must be a string" };
  }
  const name = input.trim();
  if (name.length === 0 || name.length > 50) {
    return { ok: false, error: "name must be 1-50 characters" };
  }
  return { ok: true, value: name };
}

export function normalizeCategoryType(input: unknown): NormalizeResult<"IN" | "OUT"> {
  if (input === "IN" || input === "OUT") return { ok: true, value: input };
  return { ok: false, error: "type must be IN or OUT" };
}

export function normalizeHidden(input: unknown): NormalizeResult<boolean> {
  if (typeof input !== "boolean") {
    return { ok: false, error: "hidden must be a boolean" };
  }
  return { ok: true, value: input };
}

export function normalizeSortOrder(input: unknown): NormalizeResult<number> {
  if (
    typeof input !== "number" ||
    !Number.isInteger(input) ||
    input < 0 ||
    input > 1_000_000
  ) {
    return { ok: false, error: "sortOrder must be a non-negative integer" };
  }
  return { ok: true, value: input };
}