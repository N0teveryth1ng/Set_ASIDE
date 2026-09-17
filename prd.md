# Product Requirements Document (PRD)

Project: **Creator Ledger — Premium Creator Financial Dashboard**
Node: `System Architecture Node`
Owner: Reviewing Executive Senior Engineer
Status: `MVP — PHASE 1 DOCS BLUEPRINT`

---

## 1. Product Statement

Marketing and deployment vehicle for a **premium, hyper-minimalist Google Sheets
financial dashboard** targeting non-technical content creators. Delivered as a
high-converting single-page landing page plus an embedded access workflow.
Bypasses complex SaaS databases entirely — the product is the sheet; the page is the funnel.

## 2. Target Niche

- Content Creators (Instagram, TikTok, Threads)
- UGC Artists
- Independent Consultants

## 3. Core Feature

Single-page conversion funnel that highlights the **friction of native Google Sheets**
against our **premium pre-built design structure** — moving the visitor from pain →
proof of feature value → one-click template access.

## 4. Feature Matrix (Mono-Grid Conversion Funnel)

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| C-01 | Hero Section | Striking typographic headline + subtext "The Google Sheet you actually want to look at." + CTA link button |
| C-02 | Pain-Point Blueprint Matrix | 3-column minimalist grid: "Ugly Corporate Layouts" vs "Broken Formulas" vs "Manual Chaos" |
| C-03 | Visual Feature Grid Showcase | Clean bordered structural showcase: "Auto-Tax Escrow Ledger," "Brand Deal Calculator," "Unified Hub Dashboard" |
| C-04 | Hand-Off Matrix | Interactive section: user clicks to copy their unique template duplicate access link. Copy is lossless-safe: `navigator.clipboard` wrapped in try/catch with `execCommand` fallback; blocked clipboard never breaks UI (state gated by result flag). Success injects high-contrast micro-feedback: outline color shift + monospace `TOKEN_COPIED // ACCESS_READY` status line, held exactly 2000 ms (motion-reduce safe) |
| C-05 | Minimalist Footer | Core micro-copy, credits, copyright markers |
| C-06 | Premium rendering | Zero-slop typography, 100% responsive layout, lightning-fast PageSpeed |
| C-07 | Interactive SaaS state | Income + Tax + Brand ROI modules become live numeric `<input>` fields bound to React `useState`; tax escrow deduction + brand ROI recompute on-screen in real time; all entries persist via `localStorage` across reloads |
| C-08 | Standalone Dashboard isolation | Dedicated full-screen workspace at `app/dashboard/page.tsx`; all inputs, calculations, and `usePersistedNumber` hooks migrate OFF the home page into the dashboard route; dashboard renders as clean premium monochromatic utility matrix; root landing gains minimal high-contrast access button linking to `/dashboard` |
| C-09 | Core Transaction Parsing & Local Data Engine | Pure-logic ledger engine inside `app/dashboard/page.tsx`: natural-language `parseTransaction(input)` extracts dynamic dollar values + token-based REVENUE/EXPENSE categories; centralized ledger auto-applies global `taxEscrowRate` to REVENUE and reduces to Total Revenue / Total Expenses / Net Profit / Total Tax Escrow Allocation / Brand Deal Net ROI; state serialized to single JSON key `creator_ledger_v2_state` in `localStorage`, surviving reloads |
| C-10 | Text Input Workspace Connection | Interface connection layer in `app/dashboard/page.tsx`: native `<textarea>` log box for typing/pasting strings; execution button that on-click captures the string → runs `parseTransaction()` → appends the `LedgerEntry` to the ledger state array → clears the textarea → fires JSON persistence; raw unstyled structural output view maps computed totals as text readouts (e.g. `<div>Total Revenue: {totals.totalRevenue}</div>`) at page bottom |
| C-11 | Final Completion Engine Sprint | Core engine finishing pass (logic only): multi-line batch parser (split `\n`, skip blank lines, parse + append every line in one sweep); global escrow adjustment node (numeric input → `taxEscrowRate` state, default 23, real-time recompute); `deleteEntry(id)` surgical destruction with auto-recompute + `creator_ledger_v2_state` resync; raw diagnostics readout panel mapping every entry to `[Delete]`-buttoned rows |
| C-12 | Complete Seapoint-Inspired UI Skin | Visual deployment pass across `app/page.tsx` + `app/dashboard/page.tsx`: chassis `bg-[#0A0A0A]` / `text-[#F3F3F3]`, zero radius everywhere (`rounded-none`); razor hairline single-pixel grids (`border border-[#161616]`), no shadows/gradients; clinical mono typography (`font-mono text-[10px] uppercase tracking-widest text-neutral-500`); `/dashboard` restructured as 2-column Command Center (left Input Console `h-64` textarea + escrow metric bar; right Operational Live Metric Ledger block cards `text-2xl font-semibold tracking-tight text-[#F3F3F3]`); Diagnostics Deletion Ledger audit rows with sharp `[Delete]` utility triggers hover-to-red |
| C-13 | Unified Seapoint Technical Grid Rebuild | Corrective full-structural rebuild of `app/dashboard/page.tsx` (supersedes MVP-011 layering): single cohesive full-screen technical dashboard grid — absolute-black chassis `bg-[#0A0A0A]` / bone `text-[#F3F3F3]` / `rounded-none`; clean 2-column block grid split by razor-thin `border border-[#161616]`; LEFT `Text Workspace Console` (header tool row with `Tax Escrow · %` numeric box → flush textarea `bg-transparent border border-[#161616] p-4 font-mono text-sm focus:border-neutral-500 outline-none w-full h-80`); RIGHT `Technical Metrics Ledger` — OLD separate numeric blocks DELETED, rebuilt as a single grid-stack card of the 5 parsed values with dense large bone labels `text-2xl font-mono tracking-tight` + micro-grey mono headers `font-mono text-[10px] text-neutral-500 uppercase tracking-widest`; below columns: `Historical Diagnostics Grid Ledger` — structural row list of parsed items, thin horizontal timeline accent rule per row + sharp red-hover `[Delete]` utility |
| C-14 | Shadcn Full Dashboard Integration | Enterprise-grade rebuild of `app/dashboard/page.tsx` on **shadcn/ui primitives**, superseding the manual Seapoint skin passes (MVP-011/MVP-012) and revising the zero-package law: init `npx shadcn@latest init` (Style: Default, Base color: Slate, CSS variables: Yes) + add `card button input textarea toast` primitives; chassis `bg-background text-foreground` deep-black premium frame with sharp micro-radii; asymmetric 2-column split view — LEFT shadcn `<Card>` Text Workspace Input Console (horizontal utility bar with labeled numeric `<Input>` bound to global `taxEscrowRate`, clean `<Textarea>` log console below, `<Button>` commit trigger) / RIGHT Data Metrics Grid Ledger (DELETE all loose floating plain-text lines; grid card stack of the 5 parser metrics as bold callouts + clinical mono labels); below: Historical Diagnostics Ledger `<Card>` row list — parsed timeline entries, each with outline delete `<Button variant="outline">` wired to `deleteEntry(id)` |

## 4b. MVP-007 Local Data Engine — Functional Specification

**1. Natural-Language Parser** — `parseTransaction(input: string): LedgerEntry`
- Extracts numeric dollar value dynamically from ANY string (e.g. `"$3,000"` or `"3000"` → float `3000`).
- Categorizes via localized tokens: `/brand|deal|sponsor|payout/i` → `REVENUE`; `/software|cost|fee|ads|camera/i` → `EXPENSE`. Unclassified input defaults to `EXPENSE` (conservative).

**2. Core Calculation Ledger** — `computeLedger(entries, taxEscrowRate): LedgerTotals`
- Global `taxEscrowRate` (%) automatically applied to ALL active `REVENUE` entries — escrow allocation = `totalRevenue × taxEscrowRate / 100`.
- Real-time reduction matrix yields: `Total Revenue`, `Total Expenses`, `Net Profit` (Rev − Exp), `Total Tax Escrow Allocation`, `Brand Deal Net ROI` (`netProfit / totalExpenses × 100`, guarded to 0 when expenses = 0).

**3. Local JSON Persistence Schema** — native data sync engine
- Single structured JSON array string under key **`creator_ledger_v2_state`**.
- Reads/writes instantly to browser `localStorage`; hydration guarded against prerender (no hydration mismatch); entries survive reloads.

## 4c. MVP-008 Text Input Workspace — Functional Specification

**UI-agnostic connection layer** (no layout/themes/colors — pure HTML form elements + state sync):

1. **Workspace Log Box** — native `<textarea>` where users type or paste transaction strings.
2. **Execution Action Trigger** — HTML `<button>` that on-click:
   captures the string → `parseTransaction(input)` → appends the new `LedgerEntry`
   to the central ledger state array → clears the textarea → fires the
   `creator_ledger_v2_state` JSON persistence write.
3. **Raw Structural Output View** — computed `LedgerTotals` array mapped to UNSTYLED
   raw text block readouts at the page bottom (e.g. `<div>Total Revenue: {totals.totalRevenue}</div>`),
   enabling direct math verification without any styling layer.

## 4d. FINAL-COMPLETION Core Engine — Functional Specification

Pure logic / array loops / data manipulation only (no UI aesthetics).

1. **Multi-Line Batch Processing Engine** — `commitEntry` upgrade: split textarea value
   by native newlines (`\n`); loop every line independently; trim + skip blank lines;
   run `parseTransaction(line)` per line (regex value filter + keyword classification);
   append every valid `LedgerEntry` into the ledger array in a SINGLE execution sweep;
   clear the textarea and fire `creator_ledger_v2_state` persistence once.

2. **Global Escrow Adjustment Node** — native numeric `<input>` placed above the log box,
   bound to `taxEscrowRate` React state (default `23`). Any change triggers IMMEDIATE
   real-time re-evaluation of all `computeLedger` metrics across the entire active dataset.

3. **Surgical Data Destruction Engine** — utility `deleteEntry(id: string)`:
   targets central `LedgerEntry[]`, filters out the element matching the unique `id`
   (immutable `filter`), re-triggers `computeLedger` reductions, instantly serializes
   and syncs the updated dataset to `creator_ledger_v2_state` in `localStorage`.

4. **Raw Operational Diagnostics Readout Panel** — bottom display zone: `.map()` over
   active `LedgerEntry[]`; render each entry's raw field details in a basic HTML list
   node; adjacent to every trace row render a raw text `<button>[Delete]</button>`
   whose `onClick` invokes `deleteEntry(id)` for instant removal.

## 5. Business Value Metrics (Success Gate)

| Metric | Target |
|--------|--------|
| Typographic discipline | Zero-slop: strict mono-micro-label + massive-heading hierarchy, no default-styled text |
| Responsiveness | 100% — no horizontal scroll at 360px→2560px |
| PageSpeed (mobile) | ≥ 95 |
| LCP | < 1.2 s |
| First Load JS budget | ≤ 100 kB |
| CLS | ≤ 0.01 |
| Hand-Off copy success | 100% resource available for link copy |

## 6. Design Assets (Phase 2 Locked)

- **Palette**: Matte Deep Gray `#0D0D0D` · Bone White `#F3F3F3` · Hairline `#1A1A1A`
- **Text Hierarchy**: monospaced uppercase labels (`font-mono tracking-wider text-xs`)
  layered against massive, bold headings
- **Icons**: lucide-react (minimal, tree-shakeable)
- **Language**: hairline borders, zero-radius grid modules, sequence/index numerals

## 6b. Seapoint UI Skin — Visual Specification (MVP-011)

1. **Seapoint Chassis Surface** — canvas locked to deep matte black `bg-[#0A0A0A]`,
   text items bone white `text-[#F3F3F3]`; ABSOLUTE zero border radius on every
   element (`rounded-none`).
2. **Razor Hairline Grid Matrix** — all workspaces, input consoles, and data displays
   enclosed in raw single-pixel borders `border border-[#161616]`; no dropdown shadows,
   no card gradients.
3. **Navigation & Typography Hierarchy** — every secondary label, indicator, and
   component title in clinical monospaced uppercase:
   `font-mono text-[10px] uppercase tracking-widest text-neutral-500`.
4. **Command Center Layout (/dashboard)** — balanced 2-column structural grid:
   - *Left Panel — Input Console*: `<textarea>` as flush transparent grid slot
     `bg-transparent border border-[#161616] p-4 font-mono text-sm focus:border-neutral-500 outline-none w-full h-64`;
     Escrow numeric input framed as a thin horizontal metric utility bar above it.
   - *Right Panel — Operational Live Metric Ledger*: the 5 computed readouts become
     dense, border-mapped ledger block cards — huge bone-white values
     `text-2xl font-semibold tracking-tight text-[#F3F3F3]` layered beside strict
     monospaced neutral category titles.
5. **Diagnostics Deletion Ledger** — active entries rendered as a clean financial
   audit-sheet row list; each row carries a thin horizontal timeline rule; `[Delete]`
   styled as sharp utility triggers:
   `border border-[#161616] text-neutral-400 font-mono text-[10px] px-2 py-0.5 uppercase hover:bg-red-950/30 hover:text-red-400 hover:border-red-900 transition-colors`.

## 6c. Unified Seapoint Technical Grid — Visual Specification (MVP-012, supersedes §6b)

1. **Seapoint Chassis Surface** — `bg-[#0A0A0A]` absolute black fill, `text-[#F3F3F3]`
   bone text, `rounded-none` zero-radius enforcement (same as §6b).
2. **Core Columns Layout Structure** — full-viewport 2-column block grid, razor-thin
   `border border-[#161616]` split:
   - *LEFT COL — Text Workspace Console*: horizontal header tool section holding the
     numeric dynamic global Escrow input box (`Tax Escrow · %`); directly beneath it
     the large plain-text `<textarea>` console for pasted notes, styled as a fully
     flush transparent canvas: `bg-transparent border border-[#161616] p-4 font-mono text-sm focus:border-neutral-500 outline-none w-full h-80`.
   - *RIGHT COL — Technical Metrics Ledger*: DELETE the old separate numeric blocks;
     single **grid-stack card container** rendering the 5 parse-loop values —
     Total Revenue, Total Expenses, Net Profit, Total Tax Escrow Allocation,
     Brand Deal Net ROI — as dense large bone labels `text-2xl font-mono tracking-tight`
     beside micro-grey mono category headers `font-mono text-[10px] text-neutral-500 uppercase tracking-widest`.
3. **Historical Diagnostics Grid Ledger** (below the main columns) — clean structural
   row list of every successfully parsed item; each description line wrapped with a
   thin horizontal timeline accent rule; adjacent sharp red-hover utility trigger
   `[Delete]` per row (class set per §6b item 5) for instant removal.

## 6d. Shadcn Domain — Selection + Mapping (MVP-013, supersedes §6b/§6c primitives)

**Init blueprint (post-approval, @coder):**
- `npx shadcn@latest init` → Style: **Default** · Base color: **Slate** · CSS variables: **Yes**
- Full **dark** mode chassis (vars set via `globals.css` `:root`/`.dark`; dashboard forced dark)
- `npx shadcn@latest add card button input textarea toast`
- Scaffolds: `components.json`, `lib/utils.ts` (`cn` shadcn util), `components/ui/{card,button,input,textarea,toast,skeleton}.tsx`; deps: Radix UI primitives + `class-variance-authority` + `tailwindcss-animate` + `sonner`/toast

**Dashboard mapping (replaces manual Seapoint grid):**
1. **Global Panel Chassis** — page wrapper `bg-background text-foreground` on `#0A0A0A`-class dark theme; **sharp micro-radii** (`rounded-md`/`rounded-sm` shadcn defaults; supersedes the `rounded-none` manual lock for dashboard chrome).
2. **Split View** — asymmetric 2-col `grid` (LEFT ~3fr / RIGHT ~2fr), razor `border-border` division:
   - *LEFT — Text Workspace Input Console*: shadcn `<Card>` → horizontal utility bar (mono label `Tax Escrow · %` + `<Input type="number">` bound to global `taxEscrowRate` state, default 23, instant recompute) → `<Textarea>` log console (`w-full`, md mono) → `<Button>` **Commit** trigger (runs batch commit + toast confirm).
   - *RIGHT — Data Metrics Grid Ledger*: all loose `<div>` readout lines DELETED; `grid gap-*` card stack of the 5 parser values (Total Revenue / Total Expenses / Net Profit / Total Tax Escrow Allocation / Brand Deal Net ROI) as `<CardHeader>`+`<CardTitle>` clinical mono labels beside `<CardContent>` bold metric callouts (`text-2xl font-bold tracking-tight`).
3. **Historical Diagnostics Ledger List** — below the split grid: shadcn `<Card>` wrapping the `.map(entries)` row list; each row = raw description + `<Button variant="outline" size="sm">Delete</Button>` wired to `deleteEntry(id)` array destruction; toast fired on removal.

**Engine preserved wholesale:** `parseTransaction` / `computeLedger` / `serializeLedger` / `hydrateLedger` / batch `commitEntry` / `deleteEntry(id)` / `creator_ledger_v2_state` — only the wrapper layer is rebuilt.

## 7. Target Requirements

- Framework: Next.js 14 (App Router) · React 18 · TypeScript strict
- Styling: Tailwind CSS 3
- **System State: Zero external packages (REVISED by C-14/MVP-013)** — original law kept
  the landing at zero (page.tsx natively Tailwind + lucide-react); the `/dashboard`
  route now adopts shadcn/ui primitives (Radix + cva + tailwindcss-animate + sonner)
  to eliminate hand-rolled visual drift. Landing page stays zero-package.
- Production build must pass `npm run build` with type-checking clean