# Architecture Document (ARCH)

Project: **Creator Ledger — Premium Creator Financial Dashboard**
Node: `System Architecture Node`
Last updated: 2026-09-16 (v2 pivot)

---

## 1. System Layout

```
Browser
   │  HTTPS (dev: http://localhost:3000)
   ▼
Next.js 14.2.35 (App Router) ── Static Generation, route "/"" 
   │
   └─ app/page.tsx  ALL UI compiles natively here (Mono-Grid Design Matrix)
         ├─ Hero             (headline + subtext + CTA + LIVE Income/Tax/ROI modules)
         ├─ PainPointMatrix  (3-col: Ugly Corporate Layouts / Broken Formulas / Manual Chaos)
         ├─ FeatureGrid      (Auto-Tax Escrow Ledger / Brand Deal Calculator / Unified Hub Dashboard)
         ├─ HandOffMatrix    (client-side click-to-copy + execCommand fallback + micro-feedback state)
         └─ Footer           (micro-copy, credits, copyright)
        + tiny client clipboard hook for the Hand-Off Matrix (only interactive island)
   └─ app/dashboard/page.tsx  /dashboard — full-screen isolated utility workspace
        (all live inputs, calculators, usePersistedNumber state migrate here, MVP-006)
```

No backend, no database, no runtime data fetching. The product is a static Sheet link.

## 2. Component Hierarchy (Mono-Grid Design Matrix)

```
Page() ─ app/page.tsx              (landing / marketing funnel)
 ├── Hero        (headline + subtext + CTA → /dashboard access button)
 ├── PainPointMatrix
 ├── FeatureGrid
 ├── HandOffMatrix
 └── Footer

DashboardPage() ─ app/dashboard/page.tsx   (isolated user workspace, MVP-006)
 ├── Income input + escrow calculator
 ├── Brand Deal ROI calculator
 ├── usePersistedNumber persistence (migrated here)
 └── Local Data Engine (MVP-007)
      ├── parseTransaction(input) → LedgerEntry
      ├── computeLedger(entries, taxEscrowRate) → LedgerTotals
      └── creator_ledger_v2_state JSON sync (localStorage)

 Text Input Workspace (MVP-008) — connection layer
      ├── <textarea>  log box (type/paste raw strings)
      ├── <button>    on-click: capture → parseTransaction → append → clear → persist
      └── <div> raw readouts: totals mapped unstyled (math verification)

 Final Completion Engine (FINAL-COMPLETION) — logic-only pass
      ├── commitEntry: batch split \n → loop → skip blanks → parse each → sweep append
      ├── taxEscrowRate numeric input node (default 23) → real-time recompute
      ├── deleteEntry(id): filter ledger → recompute → resync localStorage
      └── diagnostics panel: .map() entries → raw rows + [Delete] buttons

 Seapoint Technical Grid (MVP-012) — unified full-screen rebuild (supersedes MVP-011)
      ├── LEFT : Text Workspace Console
      │     ├── header tool row → global Escrow numeric box (Tax Escrow · %)
      │     └── flush textarea console (bg-transparent, border-[#161616], h-80)
      └── RIGHT : Technical Metrics Ledger (single grid-stack card)
            └── 5 parse-loop metrics: Total Revenue / Total Expenses / Net Profit /
                Tax Escrow Allocation / Brand Deal Net ROI
                → text-2xl font-mono tracking-tight values + micro-grey mono headers
      └── Historical Diagnostics Grid Ledger (below columns)
            └── parsed-item rows + thin timeline rule + [Delete] trigger

 Shadcn Dashboard (MVP-013) — enterprise wrapper, supersedes manual grid
      ├── Chassis: bg-background text-foreground (dark, #0A0A0A-class) · micro-radii
      ├── Split view (asymmetric 2-col, border-border razor split)
      │     ├── LEFT  Card: header utility bar (Tax Escrow · % Input) +
      │     │          Textarea log console + Button commit (batch + toast)
      │     └── RIGHT Data Metrics Grid Ledger: grid card stack of the 5
      │            parser metrics (CardTitle mono labels + bold callouts)
      └── Historical Diagnostics Ledger: Card row list + outline Delete
            button per entry wired to deleteEntry(id)
```

- Landing page (`app/page.tsx`) keeps marketing sections + a minimal high-contrast
  access button (MVP-006) linking to `/dashboard`; live calculator state moves out
  to the dashboard route.
- Dashboard (`app/dashboard/page.tsx`) owns ALL interactive inputs, calculations,
  and `usePersistedNumber` localStorage tracking hooks — clean premium monochromatic
  utility matrix layout, zero external packages, same matte/bone/hairline language.

## 3a. Seapoint Skin Token Map (MVP-011)

| Role | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Chassis fill | `#0A0A0A` | `bg-[#0A0A0A]` | Full-canvas surface (all routes) |
| Chassis text | `#F3F3F3` | `text-[#F3F3F3]` | Bone-white values + headings |
| Razor hairline | `#161616` | `border border-[#161616]` | Every module/grid/console rule |
| Neutral labels | — | `font-mono text-[10px] uppercase tracking-widest text-neutral-500` | All secondary labels/titles |
| Metric values | — | `text-2xl font-mono tracking-tight text-[#F3F3F3]` | Ledger numbers (MVP-012) |
| Console textarea | — | `bg-transparent border border-[#161616] p-4 font-mono text-sm focus:border-neutral-500 outline-none w-full h-80` | Text workspace console (MVP-012) |
| Delete trigger | — | `border border-[#161616] text-neutral-400 font-mono text-[10px] px-2 py-0.5 uppercase hover:bg-red-950/30 hover:text-red-400 hover:border-red-900 transition-colors` | Diagnostics [Delete] utility |

Radius: **zero everywhere** — `rounded-none`, no `rounded-*` survivors.
Shadows/gradients: forbidden (no `shadow-*`, no gradient utilities).
Escrow numeric input lives in the LEFT header tool row; 5 metrics stack inside the
RIGHT grid-stack card; diagnostics rows run below both columns as a full-width ledger.
Landing `app/page.tsx` shares Chassis + Razor + Typography binds; `/dashboard` adopts
the unified Seapoint Technical Grid per prd §6c (MVP-012 supersedes MVP-011 layout).

## 3b. Shadcn Domain Map (MVP-013, supersedes manual grid primitives)

| Concern | Resolution |
|---------|-----------|
| styling | shadcn/ui `components/ui/*` (card, button, input, textarea, toast) + `lib/utils.ts` (`cn`) |
| deps added | `class-variance-authority`, `tailwindcss-animate`, Radix primitives, `sonner` |
| css vars | `globals.css` `:root`/`.dark` hsl tokens (Base color: Slate); dashboard in dark |
| tokens | `bg-background` / `text-foreground` / `border-border` replace `bg-[#0A0A0A]`/`border-[#161616]` on `/dashboard`; radius = shadcn micro-radii (`rounded-md`) superseding `rounded-none` chassis lock for dashboard chrome |
| layout | asymmetric 2-col split (LEFT Input Console / RIGHT Metrics Ledger, grid-cols), + full-width Historical Diagnostics Card below |
| engine | FULLY PRESERVED: §7 Type Contract unchanged — wrapper layer only |

Landing `/` retains zero-package native Tailwind per §3a; dashboard now consumes the
shadcn domain layer.

## 3. Design Token Mapping

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| matte | `#0D0D0D` | `bg-matte`/`text-matte` | Page + module fills |
| bone | `#F3F3F3` | `bg-bone`/`text-bone` | Primary text |
| hairline | `#1A1A1A` | `border-hairline` | Grid rules, module borders |

Text hierarchy lock: `font-mono tracking-wider text-xs uppercase` micro-labels →
`font-sans font-bold tracking-tight` massive display headings.

## 4. Data Flows

1. **Static render** → `/` prerendered at build time (`○ Static`); zero data fetch.
2. **Hand-Off copy (MVP-002)** → user click → `copyLink()`:
   `navigator.clipboard.writeText(TEMPLATE_COPY_URL)` inside try/catch; on rejection
   falls back to `legacyCopy()` (`execCommand`); result gates `copied` via `ok` flag —
   blocked clipboard never breaks UI. On success: `copied = true` for exactly 2000 ms
   (ref-guarded timer) driving high-contrast micro-feedback — border/outline color shift
   to `border-bone` + monospaced line `TOKEN_COPIED // ACCESS_READY`, then auto-reset.
   No network, no backend. URL source: single constant `TEMPLATE_COPY_URL`
   (MVP-003: value now the production forced-copy link).
3. **Live calculator state (MVP-005 → MVP-006)** → calculator inputs, real-time
   escrow/ROI logic, and `usePersistedNumber` localStorage hooks MIGRATE to the
   isolated `/dashboard` route (`app/dashboard/page.tsx`). Dashboard recomputes on
   keystroke and persists via the hydration-guarded hook; values survive reloads.
   Landing page retains only the marketing funnel + a minimal high-contrast access
   button (MVP-006) linking `/` → `/dashboard`.
4. **Transaction parsing + local data engine (MVP-007)** → user pastes a natural-language
   line → `parseTransaction` extracts float + REVENUE/EXPENSE category → appended to
   central `LedgerEntry[]` → `computeLedger` reduces the array in real time against a
   global `taxEscrowRate` to the 5-metric matrix → serialized as `creator_ledger_v2_state`
   (single JSON string) to `localStorage`, hydrated guardedly on mount. Zero network.
5. **Text input → parse pipeline (MVP-008)** → `<textarea>` commit → button handler:
   `parseTransaction(textarea.value)` → `setEntries([...entries, entry])` →
   re-derive `LedgerTotals` via `computeLedger` → serialize `creator_ledger_v2_state`
   → textarea cleared → raw unstyled readouts re-render live totals. State sync only,
   no styling dependencies.
6. **Batch pipeline (FINAL-COMPLETION)** → multi-line commit: `value.split("\n")` →
   for each trimmed non-empty line → `parseTransaction` → append all in one sweep →
   single persistence write. Escrow node binds `taxEscrowRate` state (default 23),
   recomputing `computeLedger` instantly on change.
7. **Destruction pipeline (FINAL-COMPLETION)** → `deleteEntry(id)` filters the array,
   recomputes `LedgerTotals`, re-serializes `creator_ledger_v2_state`; diagnostics
   panel `.map()`s live entries to rows with `[Delete]` triggers.

## 5. Folder Map

```
C:\Users\S Das\OneDrive\Documents\Default Project
├── app/
│   ├── layout.tsx          Root layout (metadata, fonts — Inter + JetBrains Mono)
│   ├── page.tsx            Landing funnel: Hero, PainPointMatrix, FeatureGrid,
│   │                       HandOffMatrix, Footer + /dashboard access button
│   ├── dashboard/
│   │   └── page.tsx        ISOLATED workspace (MVP-006): live inputs, calculators,
│   │                       usePersistedNumber hooks + LOCAL DATA ENGINE (MVP-007)
│   │                       + Shadcn wrapper (MVP-013)
│   └── globals.css         Tailwind layers, reduced-motion + shadcn HSL vars (Slate)
├── components/
│   └── ui/
│       ├── card.tsx        Card / CardHeader / CardTitle / CardContent / CardDescription
│       ├── button.tsx      Button (variants: default/outline/ghost…)
│       ├── input.tsx       Input
│       ├── textarea.tsx    Textarea
│       └── toast.tsx       Toast (+ toaster store)
├── lib/
│   └── utils.ts            cn() shadcn class-merge helper
├── utilities/
│   └── navConfig.ts        LEGACY — orphaned after R-001 reset, removal pending
├── components.json         Generated by shadcn init (Style Default / Slate / CSS vars)
├── tailwind.config.ts      TOKENS TO UPDATE (matte/bone/hairline → shadcn vars) — Phase 3
├── next.config.mjs
├── tsconfig.json           Path alias @/* → ./*
├── postcss.config.mjs
└── package.json            deps: next, react, react-dom, lucide-react + shadcn stack
                           (class-variance-authority, tailwindcss-animate, Radix, sonner)
```

## 6. Absolute Entry-Points

- **Render entry**: `app/page.tsx` (route `/`) · **Dashboard**: `app/dashboard/page.tsx` (route `/dashboard`, MVP-006)
- **UI primitives**: `components/ui/*` + `components.json` (shadcn, MVP-013)
- **Design tokens**: `tailwind.config.ts` + `globals.css` HSL vars (Slate) · shadcn — Phase 3 of MVP-013
- **Template access constant**: `TEMPLATE_COPY_URL` inside `app/page.tsx`
- **Runtime**: `npm run dev` (port 3000) · `npm run build` · `npm run start`

## 7. Local Data Engine — Type Contract (MVP-007)

```ts
// app/dashboard/page.tsx  (pure logic — no UI/styling concerns)
type TxCategory = "REVENUE" | "EXPENSE";

interface LedgerEntry {
  id: string;        // crypto.randomUUID() (fallback: Date.now-based)
  raw: string;       // original natural-language input
  amount: number;    // parsed float (commas + $ stripped)
  category: TxCategory;
  createdAt: number; // epoch ms
}

interface LedgerTotals {
  totalRevenue: number;         // Σ REVENUE
  totalExpenses: number;        // Σ EXPENSE
  netProfit: number;            // totalRevenue − totalExpenses
  taxEscrowAllocation: number;  // totalRevenue × taxEscrowRate / 100
  brandDealNetRoi: number;      // netProfit / totalExpenses × 100 (0 when expenses = 0)
}

// Parser: /(\$\s?)?([\d,]+(?:\.\d{1,2})?)/ → float
// Tokens: /brand|deal|sponsor|payout/i → REVENUE
//         /software|cost|fee|ads|camera/i → EXPENSE  (default: EXPENSE)
function parseTransaction(input: string): LedgerEntry;

function computeLedger(entries: LedgerEntry[], taxEscrowRate: number): LedgerTotals;

// Persistence schema
const PERSISTENCE_KEY = "creator_ledger_v2_state"; // single JSON string of LedgerEntry[]
function serializeLedger(entries: LedgerEntry[]): string;
function hydrateLedger(raw: string | null): LedgerEntry[]; // validated, non-throwing

// Component state wiring (MVP-008): 
//   const [entries, setEntries] = useState<LedgerEntry[]>(hydrated);
//   const totals = useMemo(() => computeLedger(entries, taxEscrowRate), [entries, taxEscrowRate]);
//   <textarea value={draft} onChange={...}/> + <button onClick={commit}/>
//   Raw output: <div>Total Revenue: {totals.totalRevenue}</div> … (unstyled readouts)
// Final engine wiring (FINAL-COMPLETION):
//   commit(): entries.push(...value.split("\n").map(trim).filter(Boolean).map(parseTransaction));
//   taxEscrowRate: number (state, default 23) — numeric <input> above log box, live recompute
//   deleteEntry(id: string): void — setEntries(entries.filter(e => e.id !== id))
//   Diagnostics: {entries.map(e => <li key={e.id}>{e.raw}<button onClick={() => deleteEntry(e.id)}>[Delete]</button></li>)}
// MVP-013 wrapper note: engine signatures UNCHANGED; components swap to shadcn
//   (Card/Input/Textarea/Button/Toast) — UI contract below is stable.
```