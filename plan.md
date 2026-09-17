# Creator Ledger — Project Plan

The whole idea, the problem, and the plan to cut the spreadsheet.

---

## 1. The Concept

**Creator Ledger is the self-contained financial cockpit for solo content creators.**

It is a single, hyper-minimalist dashboard where a creator pastes their business
in plain language — a brand deal, a payout, a camera cost, a software fee — and
the system does the accounting: it reads the line, classifies it, updates five
live metrics, tucks away a tax escrow automatically, and keeps everything saved
locally across sessions.

No sign-up, no backend, no CSV exports, no formulas to maintain. Type a note,
hit Commit, get a clean board of numbers. That is the entire product.

---

## 2. The Problem

### 2.1 Who we serve

Non-technical solo businesses: Instagram/TikTok/Threads creators, UGC artists,
freelance consultants. People whose *work* is producing content, whose *income*
is deal-based and lumpy, and who have zero interest in bookkeeping.

### 2.2 What hurts them today

| Pain | Description |
|------|-------------|
| **Manual chaos** | Deals, payouts, and costs are scattered across DMs, emails, and notes. By the time revenue is needed, the trail is gone. |
| **Broken formulas** | The people who do try spreadsheets copy templates they do not understand; one broken formula silently corrupts the whole year. |
| **Ugly corporate layouts** | Every accounting tool looks like an enterprise ERP. Nothing says "made for a creator." |
| **No tax readiness** | Revenue lands, nobody sets aside the tax cut, and the end of the year is a panic of catching up. |
| **Spreadsheet terror** | Google Sheets files get duplicated, shared, edited wrong, and lost. They are documents, not a system. |

### 2.3 The core insight

Creators do not need *accounting software* — they need **an inbox that does arithmetic**.
The friction is not the math. The friction is *input*. If entering a transaction is
as easy as writing a note to yourself, the ledger fills itself and stays honest.

---

## 3. What We Are Actually Building (MVP so far)

A two-route Next.js application:

- **Landing (`/`)** — the funnel: pitch, pain points, features, and a one-click
  hand-off into the workspace.
- **Dashboard (`/dashboard`)** — the engine:

  - a **natural-language text parser** — `parseTransaction` reads a line like
    `Brand payout $3,000` or `Camera cost 800`, extracts the amount, and
    classifies it REVENUE or EXPENSE automatically;
  - a **batch commit loop** — paste several lines at once; every non-empty line
    is parsed and appended in a single sweep;
  - a **global tax escrow** — one number (`default 23%`) applied to all revenue,
    giving an instant "set aside" figure;
  - **five live metrics** — Total Revenue, Total Expenses, Net Profit, Tax
    Escrow Allocation, Brand Deal Net ROI — recomputed on every change;
  - a **historical diagnostics ledger** — every parsed entry as an audit row
    with a `[Delete]` trigger for instant correction;
  - **local-first persistence** — the whole state survives reloads via
    `localStorage` (`creator_ledger_v2_state`), zero servers.

The interface is an enterprise-grade shadcn/ui slate chassis: clinical mono
labels, dense bold metrics, razor hairline grids — a tool that feels as serious
as the work.

---

## 4. The Plan: Ditching the Excel-Type Thing

### 4.1 Why we are cutting the spreadsheet

The original incarnation sold a **Google Sheets template** — "the product is the
sheet; the page is the funnel." The sheet experiment taught us exactly what
needed to be built next:

1. **Sheets are not a product** — they are a shared document. There is no
   versioning sanity, no structured input, no enforcement of correctness.
2. **They leak users** — every click-to-copy sends a creator out of our
   experience onto a foreign tool where the magic dies.
3. **They cannot own the interaction** — no live parsing, no custom UI, no
   delete-with-a-button, no design language.
4. **They are a dead end for the brand** — a premium product cannot live inside
   a commodity spreadsheet.

So the strategic pivot: **the sheet is retired as the deliverable.** It becomes
data. What we ship is the web app that *replaces* it.

### 4.2 The migration plan (in sequence)

| Phase | Move | Outcome |
|-------|------|---------|
| **1** | Cut the template as the pitch — the dashboard IS the product | Product owns the full experience; no click-to-copy out to a foreign tool |
| **2** | Keep the landing funnel, re-point the CTA at the live workspace | Zero external hand-off; the funnel now converts into the working tool |
| **3** | Upgrade persistence from `localStorage` → structured export (CSV/JSON) + import | Data is never trapped; creators can leave cleanly — trust feature |
| **4** | (Future) Accounts + encrypted cloud sync | Multi-device without blessing spreadsheets |
| **5** | (Future) Smarter parser — dates, recurring deals, per-category ledger views | The "notes inbox" turns into a real reporting surface |

### 4.3 The design rules we carry forward

- **Input first.** Commit-by-paste remains the fastest path to a full ledger.
- **One number of trust — the escrow.** Automatic tax set-aside is the headline feature.
- **Local-first until told otherwise.** No account, no backend, no lock-in.
- **Premium minimal.** Matte black, bone white, mono micro-labels, dense metrics —
  zero visual slop.
- **Deletion is immediate and surgical.** Every wrong entry dies with one click.

---

## 5. Where We Stand Today

- **Done:** parser engine, batch commit, escrow node, delete routine, local
  persistence, shadcn dashboard skin, green build, live dev server.
- **Next:** the CTA/link strategy on the landing (stop linking to a Sheet),
  then export/import, then (optionally) sync.

The spreadsheet era is over. The ledger is local, fast, and ours.