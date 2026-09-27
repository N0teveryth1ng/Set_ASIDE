"use client";

import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Area, AreaChart, ReferenceDot, XAxis, YAxis } from "recharts";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import type { Period, CategoryTotal, TrendPoint, Totals } from "@/lib/ledger/types";
import type { Summary } from "@/lib/summary";
import { DEFAULT_CARDS, type CardToken } from "@/lib/settings";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
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

// A real, data-bound chart: Recharts <Area type="monotone"> renders the same
// trailing 12-month net series that drives the dashboard, so the curve always
// follows the actual ledger — no hardcoded decorative shape.

function NetPositionChart({ trend }: { trend: TrendPoint[] }) {
  const data = trend.map((p) => ({
    label: monthLabel(p.month),
    netCents: p.netCents,
  }));
  const values = data.map((d) => d.netCents);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const domain: [number, number] = lo === hi ? [lo - 1, hi + 1] : [lo, hi];
  const last = data[data.length - 1];
  const chartConfig = { netCents: { label: "Net" } } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      aria-label="Net position trend"
      className={`h-20 w-64 shrink-0 ${palette.gainStroke} [&_.recharts-area-curve]:[stroke-linecap:butt]`}
    >
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="netPositionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="currentColor" stopOpacity={0.28} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={domain} />
        <Area
          dataKey="netCents"
          type="monotone"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="butt"
          fill="url(#netPositionFill)"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        {last && (
          <ReferenceDot
            x={last.label}
            y={last.netCents}
            r={3}
            fill="currentColor"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={1}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}

function CountCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: string;
  icon: ReactNode;
}) {
  return (
    <div className={`${recipe.surface} ${space.card}`}>
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${palette.inkSoft} ${palette.textGhost}`}
        >
          {icon}
        </span>
        <p className={type.cardLabel + " " + palette.textFaint}>{label}</p>
      </div>
      <p className={`mt-3 ${type.cardValue} ${tone}`}>{value}</p>
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
  const signedNet = signed(summary.totals.netCents, summary.currency);

  return (
    <div className={`${recipe.surface} ${space.cardLg}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className={type.caps + " " + palette.textGhost}>Net Position</p>
          <p
            key={`${summary.period}-${summary.totals.netCents}`}
            className={`animate-rise mt-3 ${type.heroNumber} ${signedNet.tone}`}
          >
            {signedNet.text}
          </p>
          <p className={`mt-2 text-xs ${palette.textGhost}`}>
            {summary.totals.count} {summary.totals.count === 1 ? "entry" : "entries"} in{" "}
            {PERIOD_LABELS[summary.period]}
          </p>
        </div>
        <NetPositionChart trend={summary.trend} />
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
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
    <div className={`${recipe.surface} ${space.card}`}>
      <h2 className={type.sectionTitle + " " + palette.text}>Breakdown by category</h2>
      <ul className="mt-5 space-y-4">
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
                <span className={`font-semibold tabular-nums ${tone}`}>{amount}</span>
              </div>
              <div className={`mt-1.5 h-2 overflow-hidden rounded-full ${palette.inkSoft}`}>
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
    <div className={`${recipe.surface} ${space.card}`}>
      <h2 className={type.sectionTitle + " " + palette.text}>Monthly trend</h2>
      <div className="mt-5 flex h-32 items-end gap-1.5">
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
    <div className={space.stackLg}>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <CountCard
            label="Money in"
            value={signed(totals.inCents, summary.currency).text}
            tone={palette.gainText}
            icon={<TrendingUp size={14} strokeWidth={2} />}
          />
          <CountCard
            label="Money out"
            value={`\u2212${money(totals.outCents, summary.currency)}`}
            tone={palette.lossText}
            icon={<TrendingDown size={14} strokeWidth={2} />}
          />
        </div>
      );
    case "tax":
      return (
        <CountCard
          label="Tax set-aside"
          value={money(summary.taxSetAside, summary.currency)}
          tone={palette.text}
          icon={<PiggyBank size={14} strokeWidth={2} />}
        />
      );
    default:
      return <></>;
  }
}