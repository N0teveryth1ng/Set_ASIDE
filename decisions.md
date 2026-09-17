# Set-Aside — Decisions Ledger

Pruned at Phase 0. Prior history (the NORM® demo and the Creator Ledger
spreadsheet prototype, D-001…D-020) was superseded and removed per the
delete-discipline rule — this file now holds decisions that still bind.

| # | Decision | Why it binds |
|---|----------|--------------|
| D-001 | Spreadsheet era closed. Set-Aside is a real application; zero references to sheets in code or copy, and no template link anywhere | The product must be self-contained; a funnel to a shared document is a different (dead) product |
| D-002 | Money is integer cents; floats are forbidden in storage and in computed totals | Exactness for money; rounding drift is unacceptable |
| D-003 | Direction is derived from the category's type (IN/OUT); entries never store a sign; inputs reject negative amounts | Single source of truth for the sign convention; prevents contradictory data |
| D-004 | Sign convention: OUT negative, IN positive; green gain / red loss / gray zero on every signed number | One visual language for "did I gain or lose" |
| D-005 | Real accounts before any protected surface exists: Supabase Auth + row-level security on every owned table (`user_id`), enforced in the database | Privacy is the product's founding constraint, not an afterthought |
| D-006 | Aggregation lives as pure functions in `lib/ledger/` with unit tests; API routes consume them; components never recompute ledger math | One tested implementation; UI cannot drift from the math |
| D-007 | Presets (Freelance / Business / Personal / Creator) seed per-user categories on first login; no global categories | Zero-config onboarding without coupling users together |
| D-008 | Import flags bad rows as skippable; nothing is silently dropped or silently corrected | A wrong recorded number is worse than a flagged blank |
| D-009 | Entry validation: positive amount, category-derived sign, date + category required, "Uncategorized" fallback | Locked input rules shared across manual entry, edit, and import |
| D-010 | Every phase carries a delete list; no phase closes with old and new UI both live | The discipline that ended the repo's history of compounding superseded layers |
| D-011 | In-app data access is via Supabase REST (publishable key + the user's session JWT) so RLS is the ownership boundary at request time; Prisma is for migrations, seeds, and SQL-level admin only | D-005 is only real if the app itself never connects as the bypassing owner role |
| D-012 | Every table's `id` is DB-generated (`gen_random_uuid()`), never client-supplied | PostgREST inserts cannot carry Prisma-style client ids; REST API clients omit `id` |
| D-013 | Publishable/secret key pair (`sb_publishable_…` for browsers, `sb_secret_…` for server-only, admin-endpoint), legacy `anon`/`service_role` not relied upon | Supabase deprecates the JWT keys by end of 2026 |
| D-014 | The public `"User"` row is projected lazily from `auth.users` on first onboarding (id = auth uid, inserted RLS-scoped); no background sync of identities | Keeps the owner table valid for FKs (Category/Entry/Settings) without a trigger pipeline |