# Set-Aside — Phased Build Plan

Authoritative roadmap. Every phase has a fixed scope, an explicit acceptance
test, and a delete list — files/features that must be removed, not just
superseded. That last part is the discipline the old repo never had, and it's
non-negotiable this time. No phase closes with old and new UI both live.

---

## Phase 0 — Clean slate

**Goal:** stop building on top of rot.

- **Delete:** `app/page.tsx` content, `app/dashboard/page.tsx` content,
  `agents.md`, `progress.md`, `utilities/navConfig.ts`, all shadcn components
  pulled ad hoc so far.
- Rewrite `package.json` name to `set-aside`.
- New `prd.md` (one page, zero CSS classes in it) and `arch.md` (layers +
  contracts only) reflecting everything locked above. `decisions.md` kept but
  pruned to decisions that still bind.
- Init Supabase project (Postgres + Auth). Init Prisma, pointed at Supabase's
  connection string.
- **Acceptance:** repo builds, renders a blank Next.js app, zero references to
  Google Sheets anywhere in code or copy.

## Phase 1 — Data model & domain layer

**Goal:** the schema and logic exist and are tested, before any UI touches them.

- Prisma schema: `User`, `Category` (name, type: IN/OUT, user-owned, seeded per
  preset), `Entry` (amount as integer cents, direction derived from
  category.type, date, note, source: manual/import, created_at), `Preset` enum,
  `Settings` (tax rate, active preset, currency display).
- `lib/ledger/`: pure functions — `computeTotals(entries, period)`,
  `computeTaxSetAside(entries, rate)`, `groupByCategory(entries)`,
  `trendSeries(entries, months)`. All pure, all unit-testable, zero React.
- Seed script: 4 presets, each with a default category set.
- **Delete list:** any leftover `parseTransaction`/`computeLedger`/`localStorage`
  code from the old build.
- **Acceptance:** unit tests pass on the domain functions with hand-built
  fixture data (including a loss month, to confirm negative Net Position
  computes correctly).

## Phase 2 — Auth

**Goal:** real accounts, before there's anything worth protecting.

- Supabase Auth: Google OAuth + magic link email.
- Session handling via Supabase's Next.js helpers; row-level ownership
  (user_id on every table, RLS policies in Supabase).
- Minimal `/login` page, protected `/dashboard/*` routes.
- **Acceptance:** a new user can sign up with Google or email, lands in an empty
  account, cannot see another user's data even by guessing an ID.

## Phase 3 — Onboarding

**Goal:** zero-config start via the preset system.

- First-login flow: preset picker (Freelance / Business / Personal / Creator) →
  seeds that user's categories.
- Step-by-step tutorial overlay (Skip/Next cards) over the Overview screen,
  shown once, dismissible, stored as `settings.onboarded = true`.
- **Acceptance:** new signup → preset choice → tutorial → lands on Overview
  showing the deliberate empty state (not zeros everywhere — an explicit
  "add your first entry or import a file" prompt).

## Phase 4 — Manual entry & Transactions page

**Goal:** the core loop works without needing import at all.

- `/dashboard/transactions`: table (shadcn data table), add-entry form with the
  locked validation rules (positive amount, category-derived sign, required
  date/category, "Uncategorized" fallback), inline edit, delete.
- API routes: `GET/POST /api/entries`, `PATCH/DELETE /api/entries/:id`.
- **Acceptance:** can add, edit, delete an entry; a loss-producing set of entries
  correctly shows negative totals downstream (tested against Phase 1's domain
  functions, not reimplemented here).

## Phase 5 — Overview dashboard

**Goal:** the actual product surface, built to the locked spec, once.

- `/dashboard`: hero Net Position + sparkline + period switcher, Money In/Out
  pair, Tax set-aside card, category breakdown list, trend chart.
- Green/red/gray convention applied everywhere a signed number appears.
- `GET /api/summary?period=` backs all of this — computed server-side using
  Phase 1 functions, not recalculated ad hoc in a component.
- **Delete list:** confirm zero leftover debug readouts
  (`<div>Total Revenue: {totals...}</div>` style) anywhere in the tree.
- **Acceptance:** dashboard reflects live entries from Phase 4 correctly across
  all four period views.

## Phase 6 — Import

**Goal:** the one-way door in, done right.

- `/dashboard/import`: upload CSV or XLSX (papaparse + xlsx) → column-mapping
  UI (map their headers to amount/date/category/note) → preview table with
  per-row validation flags (skippable, never silently dropped) → confirm →
  bulk-insert as Entries.
- `POST /api/import` (parse+preview), `POST /api/import/confirm` (commit).
- **Acceptance:** a messy real-world CSV (missing values, a stray column, a
  blank row) imports with bad rows flagged and everything else correct — never
  a silent wrong number.

## Phase 7 — Settings & customization

**Goal:** "customizable at the edges," not a formula engine.

- `/dashboard/settings`: categories (add/rename/hide/reorder), tax rate, active
  preset, which Overview cards show and in what order, CSV/PDF export by date
  range.
- `GET/PATCH /api/settings`, `GET /api/export`.
- **Acceptance:** hiding a category removes it from the breakdown and reflows
  totals correctly; export produces a correct CSV for an arbitrary date range.

## Phase 8 — Landing page & polish pass

**Goal:** the funnel matches the product, and the visual system is disciplined.

- Rewrite `/` — no Sheet references, no "Get the Template," CTA points straight
  at signup.
- One token file for color/spacing/typography (kills the
  three-competing-palettes problem for good).
- Responsive pass for the web app across common breakpoints (no mobile app, but
  the browser page shouldn't break on a laptop-narrow window).
- **Acceptance:** first-time visitor → signup → onboarding → working dashboard,
  no dead links, no stray copy referencing spreadsheets.