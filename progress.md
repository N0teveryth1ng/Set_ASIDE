# Progress Checklist — System Architecture Node

Legend: `[ ]` Todo · `[/]` In-Progress · `[x]` Completed
Superseded: v1 NORM® studio landing (F-01…F-08) is deprecated by the v2 Creator Ledger pivot.

## Phase 1 — Documentation Blueprint (Creator Ledger MVP)

- [x] Rewrite `prd.md` — Creator Financial Asset funnel, niche, feature matrix C-01…C-06, metrics, design assets
- [x] Rewrite `arch.md` — Mono-Grid Design Matrix hierarchy, token map, data flows, single-file architecture
- [x] Re-baseline `progress.md` for the v2 MVP
- [x] Log pivot in `decisions.md` (D-006 pivot + design-system decisions)
- [x] Re-baseline `agents.md` with Phase 2 implementation laws

## Phase 2 — Progress Lock (pending executive approval)

- [x] Phase 1 documentation diff approved by Executive

## Phase 3 — @coder Execution Micro-Tasks

- [x] Update `tailwind.config.ts` — add `matte`/`bone`/`hairline` tokens (#0D0D0D/#F3F3F3/#1A1A1A)
- [x] Implement `Hero` — bold headline + "The Google Sheet you actually want to look at." + CTA link button
- [x] Implement `PainPointMatrix` — 3-col grid: Ugly Corporate Layouts / Broken Formulas / Manual Chaos
- [x] Implement `FeatureGrid` — bordered showcase: Auto-Tax Escrow Ledger / Brand Deal Calculator / Unified Hub Dashboard
- [x] Implement `HandOffMatrix` — click-to-copy unique template duplicate access link (client clipboard hook)
- [x] Implement `Footer` — micro-copy, credits, copyright
- [x] Verify no placeholder copy anywhere (all real product micro-copy)
- [x] Remove orphaned `utilities/navConfig.ts` import chain (file removal decision pending)
- [x] Run `npm run build` — compile + type-check green, `/` static

## Phase 3v2 — MVP-002 Link Hand-Off Integration

- [x] Verify copy mechanics (clipboard + execCommand fallback) in `HandOffMatrix`
- [x] Harden fallback: result-gated `ok` flag; UI cannot break on blocked clipboard
- [x] Inject `border-bone` high-contrast outline micro-feedback on copied state
- [x] Add explicit `TOKEN_COPIED // ACCESS_READY` monospaced status line block (exactly 2000 ms, motion-reduce safe)
- [x] Run `npm run build` — compile + type-check green, `/` static

## Phase 3v3 — MVP-003 Asset Token Deployment

- [x] Replace `TEMPLATE_COPY_URL` value with production forced-copy link (`https://google.com`)
- [x] Verify no stale template URL remains in `app/page.tsx`
- [x] Run `npm run build` — compile + type-check green, `/` static, html contains injected URL

## Phase 3v4 — MVP-004 Forced Copy Conversion

- [x] Swap `TEMPLATE_COPY_URL` suffix from `/edit?usp=sharing` to `/copy?usp=sharing` (line 18)
- [x] Verify no stale `/edit?usp=sharing` remains in `app/page.tsx`
- [x] Run `npm run build` — compile + type-check green, `/` static
- [x] MVP-003-CORRECT: `TEMPLATE_COPY_URL` patched to full-length production link (line 18), build re-verified green

## Phase 3v5 — MVP-005 Interactive SaaS State Migration

- [x] Replace Hero Income/Tax stat labels with numeric `<input>` fields (income, escrow %, brand deal figures)
- [x] Bind inputs to `useState`; live-recompute tax escrow deduction + brand ROI on keystroke
- [x] Persist entries via `localStorage` (hydration guarded vs prerender; write on change)
- [x] Keep zero external packages; strict TS; premium matte/bone/hairline styling; responsive
- [x] Run `npm run build` — compile + type-check green, `/` static

## Phase 3v6 — MVP-006 Standalone Dashboard Isolation

- [x] Create `app/dashboard/page.tsx` — full-screen isolated utility workspace
- [x] Migrate `usePersistedNumber` hook + all numeric calculator logic/inputs OFF `app/page.tsx` into dashboard
- [x] Configure premium monochromatic utility matrix layout (matte/bone/hairline)
- [x] Root landing: minimal high-contrast access button linking `/` → `/dashboard`; Hero calculator strip removed
- [x] Run `npm run build` — compile + type-check green; both `/` and `/dashboard` static

## Phase 3v8 — MVP-008 Text Input Workspace Connection

- [x] Wire `<textarea>` log box + commit `<button>` into `app/dashboard/page.tsx`
- [x] Button on-click: capture → `parseTransaction()` → append `LedgerEntry[]` → clear textarea → fire JSON persistence
- [x] Add unstyled raw readouts block at page bottom (Totals mapped from `computeLedger`)
- [x] Run `npm run build` — compile + type-check green, `/` + `/dashboard` static

## Phase 3v9 — FINAL-COMPLETION Core Engine Sprint

- [x] Multi-line batch `commitEntry`: split `\n`, skip blanks, `parseTransaction` per line, sweep-append, single persistence
- [x] Global escrow numeric `<input>` node above log box bound to escrow/tax state (default 23) → real-time recompute
- [x] `deleteEntry(id)`: array-filter destruction → recompute → resync `creator_ledger_v2_state`
- [x] Diagnostics readout panel: `.map()` entries → raw rows + adjacent unstyled `[Delete]` buttons
- [x] Run `npm run build` — compile + type-check green, `/` + `/dashboard` static

## Phase 3v10 — MVP-013 Shadcn Full Dashboard Integration

- [x] Run `npx shadcn@latest init` — Style: Default · Base color: Slate · CSS variables: Yes
- [x] Pull primitives `npx shadcn@latest add card button input textarea toast`
- [x] Completely overwrite `app/dashboard/page.tsx` → asymmetric shadcn split view (LEFT Card console + RIGHT metrics grid ledger + Historical Diagnostics Card list w/ outline Delete → `deleteEntry(id)`)
- [x] Preserve matte/bone/hairline tokens + landing (zero-package); mount `<Toaster />` for sonner
- [x] Run `npm run build` — compile + type-check green, `/` + `/dashboard` static
- [x] Restart detached dev server on :3000 — both routes 200

## Phase 4 — State Commit (post-build)

- [x] `decisions.md` rationale entries for all C-01…C-06 implementation choices (D-014 appended)
- [x] Tick Phase 3 items `[x]`, sync `agents.md` states, drift-check `prd.md`/`arch.md`
- [x] Deliver system review report to Executive