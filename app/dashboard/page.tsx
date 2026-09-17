"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

function usePersistedNumber(key: string, initial: number) {
  const [value, setValue] = useState<number>(initial);
  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null && Number.isFinite(Number(raw))) setValue(Number(raw));
    } catch {}
    hydrated.current = true;
  }, [key]);
  useEffect(() => {
    try {
      if (hydrated.current) window.localStorage.setItem(key, String(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

type TxCategory = "REVENUE" | "EXPENSE";

interface LedgerEntry {
  id: string;
  raw: string;
  amount: number;
  category: TxCategory;
  createdAt: number;
}

interface LedgerTotals {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  taxEscrowAllocation: number;
  brandDealNetRoi: number;
}

const PERSISTENCE_KEY = "creator_ledger_v2_state";

function parseTransaction(input: string): LedgerEntry {
  const trimmed = input.trim();
  const match = trimmed.match(/(\$\s?)?([\d,]+(?:\.\d{1,2})?)/);
  const amount = match ? parseFloat(match[2].replace(/,/g, "")) : 0;
  const category: TxCategory =
    /brand|deal|sponsor|payout/i.test(trimmed)
      ? "REVENUE"
      : /software|cost|fee|ads|camera/i.test(trimmed)
        ? "EXPENSE"
        : "EXPENSE";
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    raw: trimmed,
    amount: Number.isFinite(amount) ? amount : 0,
    category,
    createdAt: Date.now(),
  };
}

function computeLedger(entries: LedgerEntry[], taxEscrowRate: number): LedgerTotals {
  const totalRevenue = entries
    .filter((e) => e.category === "REVENUE")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries
    .filter((e) => e.category === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    taxEscrowAllocation: (totalRevenue * taxEscrowRate) / 100,
    brandDealNetRoi:
      totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0,
  };
}

function serializeLedger(entries: LedgerEntry[]): string {
  return JSON.stringify(entries);
}

function hydrateLedger(raw: string | null): LedgerEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (e): e is LedgerEntry =>
          e &&
          typeof e.id === "string" &&
          typeof e.raw === "string" &&
          typeof e.amount === "number" &&
          (e.category === "REVENUE" || e.category === "EXPENSE") &&
          typeof e.createdAt === "number",
      );
    }
  } catch {}
  return [];
}

export default function Dashboard() {
  const [escrowRate, setEscrowRate] = usePersistedNumber("creator-ledger:escrow-rate", 23);

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [draft, setDraft] = useState("");
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      setEntries(hydrateLedger(window.localStorage.getItem(PERSISTENCE_KEY)));
    } catch {}
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(PERSISTENCE_KEY, serializeLedger(entries));
    } catch {}
  }, [entries]);

  const totals = useMemo(() => computeLedger(entries, escrowRate), [entries, escrowRate]);

  function commitEntry() {
    const lines = draft.split("\n");
    const next: LedgerEntry[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      next.push(parseTransaction(trimmed));
    }
    if (next.length === 0) return;
    setEntries((prev) => [...prev, ...next]);
    setDraft("");
    toast({
      title: "Ledger updated",
      description: `${next.length} entr${next.length === 1 ? "y" : "ies"} committed.`,
    });
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    toast({ title: "Entry deleted", description: "Removed from the ledger." });
  }

  const metrics: { label: string; value: string }[] = [
    {
      label: "Total Revenue",
      value: `$${totals.totalRevenue.toLocaleString("en-US")}`,
    },
    {
      label: "Total Expenses",
      value: `$${totals.totalExpenses.toLocaleString("en-US")}`,
    },
    {
      label: "Net Profit",
      value: `$${totals.netProfit.toLocaleString("en-US")}`,
    },
    {
      label: "Total Tax Escrow Allocation",
      value: `$${totals.taxEscrowAllocation.toLocaleString("en-US")}`,
    },
    {
      label: "Brand Deal Net ROI",
      value: `${totals.brandDealNetRoi.toLocaleString("en-US")}%`,
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-10">
          <p className="min-w-0 font-mono text-xs uppercase tracking-wider text-foreground/50">
            [ Creator Ledger / Workspace ]
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 font-mono text-[10px] uppercase tracking-wider"
          >
            <Link href="/">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to Landing
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Text Workspace · Input Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Tax Escrow · %
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={escrowRate}
                  onChange={(e) => setEscrowRate(Number(e.target.value) || 0)}
                  aria-label="Global tax escrow rate"
                  className="w-28 font-mono text-sm"
                />
              </label>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Brand payout $3,000 / Camera cost 800…"
                aria-label="Transaction log input"
                className="min-h-[20rem] font-mono text-sm"
              />
              <Button
                type="button"
                onClick={commitEntry}
                className="font-mono text-xs uppercase tracking-wider"
              >
                Commit Entry
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader>
                  <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold tracking-tight text-foreground">
                  {metric.value}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              [ Historical Diagnostics Ledger ]
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                No entries.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-foreground">
                        {entry.raw}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {entry.amount.toLocaleString("en-US")} · {entry.category}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 font-mono text-[10px] uppercase tracking-wider"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}