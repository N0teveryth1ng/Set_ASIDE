# Set-Aside — Architecture

Layers and contracts only. No UI styling detail.

## Layers

```
┌──────────────────────────────────────────────┐
│ UI      Next.js App Router pages             │
│         /login, /dashboard/*                 │
├──────────────────────────────────────────────┤
│ API     Route handlers:                      │
│         /api/entries, /api/summary,          │
│         /api/import, /api/import/confirm,    │
│         /api/settings, /api/export           │
├──────────────────────────────────────────────┤
│ DOMAIN  lib/ledger/ — pure, unit-tested      │
│         computeTotals, computeTaxSetAside,   │
│         groupByCategory, trendSeries         │
├──────────────────────────────────────────────┤
│ DATA    Prisma (Postgres) + Supabase         │
│         Auth + RLS enforcement               │
└──────────────────────────────────────────────┘
```

## Data contract (Phase 1 — Prisma schema targets)

- **User** — Supabase Auth identity; `id` referenced by every owned row.
- **Category** — `name`, `type` (`IN` | `OUT`), owned by one user, seeded per
  preset, user-editable thereafter.
- **Entry** — `amount` (integer cents), direction derived from its category's
  `type`, `date`, `note`, `source` (`manual` | `import`), `created_at`,
  `user_id`, nullable category (→ "Uncategorized").
- **Preset** — enum of four seeds: Freelance, Business, Personal, Creator.
- **Settings** — per user: `tax_rate`, `active_preset`, `currency_display`,
  `onboarded`.

Ownership: every owned table carries `user_id`; Supabase RLS enforces
`auth.uid() = user_id`. All access goes through Supabase sessions.

## Domain contract

```ts
// lib/ledger/ — all pure, all typed, zero React
type Period = "month" | "quarter" | "year" | "all";

computeTotals(entries: Entry[], period: Period): Totals;
//   Totals = { in, out, net, count } — cents integers

computeTaxSetAside(entries: Entry[], rate: number): number;
//   rate applied to net positive in the period; set aside in cents

groupByCategory(entries: Entry[]): CategoryTotal[];
//   sorted desc by |net|, full included even when empty

trendSeries(entries: Entry[], months: number): TrendPoint[];
//   one point per calendar month: { month, in, out, net }
```

Sign rule: OUT → negative, IN → positive; Net Position is the arithmetic sum.

## API contract

- `GET/POST /api/entries` · `PATCH/DELETE /api/entries/:id`
- `GET /api/summary?period=` — computed with `lib/ledger`, server-side only
- `POST /api/import` → parse + preview + per-row flags · `POST /api/import/confirm` → commit
- `GET/PATCH /api/settings` · `GET /api/export?from=&to=&format=csv|pdf`

## Auth & security contract

- Supabase Auth: Google OAuth + magic-link email.
- Next.js Supabase session helpers; `/dashboard/*` protected server-side.
- RLS on every owned table; no client reads bypass RLS.
- Acceptance invariant: a user can never see another user's rows, even by
  guessing an ID.

## Delete discipline

Every phase deletes what it supersedes (see `plan.md`). Reference-only history
that no longer binds is removed rather than preserved.