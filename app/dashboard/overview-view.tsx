"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { Period, CategoryTotal, TrendPoint, Totals } from "@/lib/ledger/types";
import type { Summary } from "@/lib/summary";
import { DEFAULT_CARDS, type CardToken } from "@/lib/settings";
import { palette, recipe, space, type } from "@/lib/tokens";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All time",
};

const PERIOD_ORDER: readonly Period[] = ["month", "quarter", "year", "all"];

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(Math.abs(cents) / 100);
}

function signed(cents: number, currency: string): { text: string; tone: string } {
  if (cents > 0) return { text: `+${money(cents, currency)}`, tone: palette.gainText };
  if (cents < 0) return { text: `\u2212${money(cents, currency)}`, tone: palette.lossText };
  return { text: money(0, currency), tone: palette.textFaint };
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "short" });
  return `${name} ’${String(year).slice(2)}`;
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`${recipe.surface} p-5`}>
      <p className={type.cardLabel + " " + palette.textFaint}>{label}</p>
      <p className={`${type.cardValue} mt-2 ${tone}`}>{value}</p>
    </div>
  );
}

function HeroCard({
  summary,
  pending,
  onSelect,
}: {
  summary: Summary;
  pending: boolean;
  onSelect: (period: Period) => void;
}) {
  const nets = summary.trend.map((p) => p.netCents);
  const maxAbs = Math.max(1, ...nets.map((n) => Math.abs(n)));
  const points = nets
    .map((net, i) => {
      const x = (i / Math.max(1, nets.length - 1)) * 100;
      const y = 16 - (net / maxAbs) * 14;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className={`${recipe.surface} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={type.cardLabel + " " + palette.textFaint}>Net Position</p>
          <p className={`mt-2 text-4xl font-bold ${signed(summary.totals.netCents, summary.currency).tone}`}>
            {signed(summary.totals.netCents, summary.currency).text}
          </p>
          <p className={`mt-1 text-xs ${palette.textGhost}`}>
            {summary.totals.count} {summary.totals.count === 1 ? "entry" : "entries"} in {PERIOD_LABELS[summary.period]}
          </p>
        </div>
        <svg
          className={`h-16 w-64 ${palette.gainStroke}`}
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          aria-label="Net position trend"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {PERIOD_ORDER.map((period) => {
          const selected = summary.period === period;
          return (
            <button
              key={period}
              onClick={() => onSelect(period)}
              disabled={pending}
              className={recipe.pillToggle(selected)}
            >
              {PERIOD_LABELS[period]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Breakdown({ items, currency }: { items: CategoryTotal[]; currency: string }) {
  const maxAbs = Math.max(1, ...items.map((i) => Math.abs(i.totalCents)));
  return (
    <div className={`${recipe.surface} p-5`}>
      <h2 className={type.sectionTitle + " " + palette.text}>Breakdown by category</h2>
      <ul className="mt-4 space-y-3">
        {items.length === 0 && <li className={`${type.text} ${palette.textGhost}`}>No entries in this period.</li>}
        {items.map((item) => {
          const uncategorized = item.categoryName === "Uncategorized";
          const tone =
            uncategorized
              ? palette.textFaint
              : item.categoryType === "IN"
                ? palette.gainText
                : palette.lossText;
          const amount =
            uncategorized
              ? money(item.totalCents, currency)
              : item.categoryType === "IN"
                ? `+${money(item.totalCents, currency)}`
                : `\u2212${money(item.totalCents, currency)}`;
          return (
            <li key={item.categoryName}>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${palette.textMuted}`}>
                  {item.categoryName}
                  <span className={`ml-2 text-xs ${palette.textGhost}`}>
                    {item.count} {item.count === 1 ? "entry" : "entries"}
                  </span>
                </span>
                <span className={`font-semibold ${tone}`}>{amount}</span>
              </div>
              <div className={`mt-1 h-2 overflow-hidden rounded-full ${palette.inkSoft}`}>
                <div
                  className={`h-full rounded-full ${
                    uncategorized
                      ? palette.inkFaint
                      : item.categoryType === "IN"
                        ? palette.gainBar
                        : palette.lossBar
                  }`}
                  style={{ width: `${(Math.abs(item.totalCents) / maxAbs) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Trend({ trend, currency }: { trend: TrendPoint[]; currency: string }) {
  const maxAbs = Math.max(1, ...trend.map((p) => Math.abs(p.netCents)));
  return (
    <div className={`${recipe.surface} p-5`}>
      <h2 className={type.sectionTitle + " " + palette.text}>Monthly trend</h2>
      <div className="mt-4 flex h-32 items-end gap-1.5">
        {trend.map((point) => {
          const height = maxAbs === 0 ? 0 : Math.max(2, (Math.abs(point.netCents) / maxAbs) * 100);
          const color =
            point.netCents > 0 ? palette.gainBar : point.netCents < 0 ? palette.lossBar : palette.inkSoftHover;
          return (
            <div key={point.month} className="group relative flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-28 w-full items-end justify-center">
                <div
                  className={`w-full rounded-t ${color}`}
                  style={{ height: `${height}%` }}
                  title={`${monthLabel(point.month)}: ${signed(point.netCents, currency).text}`}
                />
                <span className={`pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded ${palette.ink} px-1.5 py-0.5 text-[10px] ${palette.textInverse} group-hover:block`}>
                  {monthLabel(point.month)} · {signed(point.netCents, currency).text}
                </span>
              </div>
              <span className={`text-[10px] ${palette.textGhost}`}>{monthLabel(point.month).slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OverviewView({
  initial,
  cards = DEFAULT_CARDS,
}: {
  initial: Summary;
  cards?: readonly CardToken[];
}) {
  const [summary, setSummary] = useState<Summary>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals: Totals = useMemo(() => summary.totals, [summary]);

  async function selectPeriod(period: Period) {
    if (period === summary.period || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/summary?period=${period}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load summary.");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  const rows: ReactElement[] = [];
  let pair: ReactElement[] = [];
  const flushPair = () => {
    if (pair.length > 0) {
      rows.push(
        <div key={`pair-${rows.length}`} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pair}
        </div>,
      );
      pair = [];
    }
  };

  for (const token of cards) {
    if (token === "breakdown" || token === "trend") {
      pair.push(
        token === "breakdown" ? (
          <Breakdown key="breakdown" items={summary.breakdown} currency={summary.currency} />
        ) : (
          <Trend key="trend" trend={summary.trend} currency={summary.currency} />
        ),
      );
      if (pair.length === 2) flushPair();
      continue;
    }
    flushPair();
    rows.push(<div key={token}>{singleCard(token, summary, totals, pending, selectPeriod)}</div>);
  }
  flushPair();

  return (
    <div className={space.stack}>
      {error && <div className={recipe.errorBox}>{error}</div>}
      {rows}
    </div>
  );
}

function singleCard(
  token: CardToken,
  summary: Summary,
  totals: Totals,
  pending: boolean,
  onSelect: (period: Period) => void,
): ReactElement {
  switch (token) {
    case "hero":
      return <HeroCard summary={summary} pending={pending} onSelect={onSelect} />;
    case "money":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CountCard label="Money in" value={signed(totals.inCents, summary.currency).text} tone={palette.gainText} />
          <CountCard label="Money out" value={signed(totals.outCents, summary.currency).text} tone={palette.lossText} />
        </div>
      );
    case "tax":
      return <CountCard label="Tax set-aside" value={money(summary.taxSetAside, summary.currency)} tone={palette.text} />;
    default:
      return <></>;
  }
}
