# Agent Registry — System Architecture Node

Role model: **Master Orchestrator** (central control) de-legates, never writes production source directly.

## Orchestrator

- **State**: ACTIVE
- **Role**: Parses executive direction → audits docs → locks progress → hands off → commits state
- **Constraints**: Must run the 4-phase compulsory process; no raw source edits by orchestrator itself

## @coder — Build / Execution Worker

- **State**: IDLE (returned from TASK_ID MVP-013 — SUCCESS LOOP closed, build verified)
- **Capabilities**: Script generation, terminal ops, dependency installs, debugging
- **Contract**: Must test code, verify compilation (`npm run build` / `tsc` / equivalent), and return explicit success loops before Phase 3 closes
- **Implementation Laws (Phase 2 locked)**:
  - Palette: Matte Deep Gray `#0D0D0D` · Bone White `#F3F3F3` · Hairline borders `#1A1A1A`
  - Text hierarchy: `font-mono tracking-wider text-xs` uppercase labels layered against massive bold headings
  - System state: **zero packages on landing** (`app/page.tsx` natively Tailwind + lucide-react); `/dashboard` runs shadcn/ui primitives (card/button/input/textarea/toast) + Radix/cva/tailwind-merge/tailwindcss-animate per MVP-013
- **Handoff vars**: `TASK_ID`, `TARGET_FILES`, `VERIFY_CMD`, `SUCCESS_CRITERIA`

## @doc_manager — Documentation Sync Worker

- **State**: IDLE (MVP-013 doc-state commit complete, progress ticked)
- **Capabilities**: Real-time adjustments of tracking assets; codebase file-mapping updates
- **Contract**: On Phase 4, writes `decisions.md` rationale, ticks `progress.md` items `[x]`, syncs `prd.md`/`arch.md` mapping drift
- **Handoff vars**: `CHANGED_FILES`, `DECISION_REFS`, `PROGRESS_ITEM` to tick

## Operational Constraints

1. Phase 1 documentation diff must be approved by the Reviewing Executive before Phase 2 lock.
2. No requirement is "complete" until Phase 4 doc-state commit is done.
3. Each cycle must close with a system review report to the executive.