# Set-Aside — Product Requirements

One page. No UI styling vocabulary. The product, the problem, the locked rules.

## Product

Set-Aside is a money dashboard for self-employed people — freelancers, solo
businesses, creators. You record money in and money out; Set-Aside shows your
Net Position, separates a tax set-aside automatically, and gives you a clean
category breakdown. Private by construction: real accounts, your data belongs
to you, no shared spreadsheets.

## Problem

The self-employed have income that is lumpy, expenses that are scattered, and a
tax bill nobody set aside money for. Existing options are either shared
spreadsheet documents (correctness and privacy are lost to copying, formulas,
and sharing) or heavy accounting tools built for companies with accountants.
Neither serves one person who just wants to know, at a glance: do I have money,
and is the tax set aside.

## What success looks like

A new user signs up in seconds (Google or email), picks which kind of money
life they have, and is looking at a deliberate, honest Overview — not a grid of
zeros. They add entries in plain language, categorised for them, and the led
gers, charts, and the tax set-aside update. They can import months of history
from a messy file without a single silent misread. They never touch a formula
or a shared document.

## Locked conventions (bind everywhere)

- **Money is integer cents.** Every amount is an integer of the smallest
  currency unit. No floats anywhere in storage or arithmetic.
- **Direction is derived, never stored.** A category has a type — IN or OUT.
  An entry's direction comes from its category's type. An entry never stores
  "+" or "-". Negative amounts are rejected at input.
- **Sign convention.** OUT is negative, IN is positive. Net Position is the
  arithmetic sum. Green for gain, red for loss, gray for zero — applied
  everywhere a signed number appears.
- **Categories are per user.** No category is global. Presets (Freelance,
  Business, Personal, Creator) seed a user's categories on first login; every
  category thereafter is owned and editable by that user alone.
- **Ownership is enforced in the database.** Every row carries `user_id` and is
  protected by row-level security. No code path may bypass it.
- **Domain logic is pure and shared.** All aggregation lives in pure functions
  (`lib/ledger/`) with unit tests. Server routes call them; components never
  reimplement ledger math.
- **Import never guesses.** Bad rows are flagged and skippable, never silently
  dropped or corrected. A wrong number must be impossible to commit quietly.
- **Principles of the edit:** positive amount, category-derived sign, date and
  category required, "Uncategorized" fallback allowed, inline edit + delete.
- **Discipline:** every phase removes what it supersedes. No phase closes with
  old and new surfaced side by side.

## Current scope

Phases 0–8 in `plan.md` are the roadmap. This repository is in Phase 0:
a blank, building Next.js application with no marketing copy, no sheet
references, and no leftover prototype code.