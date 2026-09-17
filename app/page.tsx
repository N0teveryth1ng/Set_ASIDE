"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Calculator,
  ChartColumn,
  Check,
  Copy,
  FileWarning,
  LayoutDashboard,
  LayoutGrid,
  ReceiptText,
  Timer,
  Vault,
} from "lucide-react";

const TEMPLATE_COPY_URL = "https://docs.google.com/spreadsheets/d/1VQpdYp_4q1hRHaKztEg8JSJjTNoBvdqjIjvyVR64dUc/copy?usp=sharing";

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function SectionHeading({
  code,
  title,
  intro,
}: {
  code: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mb-16">
      <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
        {code}
      </p>
      <h2 className="mt-4 font-bold tracking-tight text-4xl md:text-5xl">
        {title}
      </h2>
      {intro ? <p className="mt-6 max-w-2xl text-bone/60">{intro}</p> : null}
    </div>
  );
}

function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between border-b border-hairline pb-4 pt-6">
          <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
            [ 01 / Income ]
          </p>
          <p className="hidden font-mono text-xs uppercase tracking-wider text-bone/50 sm:block">
            Creator-Ledger · v2026
          </p>
        </div>
        <div className="py-32 md:py-44">
          <h1 className="max-w-5xl font-bold tracking-tight text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Your creator income.
            <br />
            Finally structured.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-bone/60">
            The Google Sheet you actually want to look at.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-bone px-8 py-4 font-mono text-xs uppercase tracking-wider text-matte transition-colors duration-200 motion-reduce:transition-none hover:border hover:border-bone hover:bg-matte hover:text-bone"
            >
              Open Dashboard
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
            <a
              href={TEMPLATE_COPY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 border border-hairline px-8 py-4 font-mono text-xs uppercase tracking-wider transition-colors duration-200 motion-reduce:transition-none hover:border-bone hover:bg-bone hover:text-matte"
            >
              Get the Template
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 border-t border-hairline py-10 sm:grid-cols-3">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
              Income tracked per creator
            </p>
            <p className="mt-2 font-mono text-2xl tracking-tight text-bone md:text-3xl">
              120K+
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
              Set aside · auto-tax escrow
            </p>
            <p className="mt-2 font-mono text-2xl tracking-tight text-bone md:text-3xl">
              23%
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
              Brand deal valuation
            </p>
            <p className="mt-2 font-mono text-2xl tracking-tight text-bone md:text-3xl">
              3-CLICK
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PainPointMatrix() {
  const pains = [
    {
      index: "01",
      icon: LayoutGrid,
      title: "Ugly Corporate Layouts",
      body: "Pre-built templates are designed for finance departments, not people. Giant headers, zebra stripes, and a watermark that dates your work the second you open it.",
    },
    {
      index: "02",
      icon: FileWarning,
      title: "Broken Formulas",
      body: "One accidentally deleted row and your totals quietly diverge. No warnings, no audit trail, no way to know what broke or when.",
    },
    {
      index: "03",
      icon: Timer,
      title: "Manual Chaos",
      body: "You juggle screenshots, emails, and three tabs just to reconstruct a single month. Every update is a manual chore with no memory.",
    },
  ];

  return (
    <section className="border-t border-hairline py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          code="[ 02 / The Problem ]"
          title="Default Sheets are a mess."
          intro="Most creator spreadsheets fail at the only job they have: telling you where your money stands. Here is exactly why they drift."
        />
        <div className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x">
          {pains.map((pain) => (
            <article key={pain.title} className="pt-10 md:px-10 md:pb-10 md:pt-12">
              <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
                {pain.index}
              </p>
              <pain.icon
                className="mt-10 text-bone/70"
                size={24}
                strokeWidth={1.5}
              />
              <h3 className="mt-6 text-2xl font-bold tracking-tight">
                {pain.title}
              </h3>
              <p className="mt-4 max-w-sm text-bone/60">{pain.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const flagships = [
    {
      icon: Vault,
      label: "Financial Core",
      title: "Auto-Tax Escrow Ledger",
      body: "Every deposit routes through a built-in escrow column. A hard percentage is set aside per entry, so quarterly filings stop being a panic.",
    },
    {
      icon: Calculator,
      label: "Valuation",
      title: "Brand Deal Calculator",
      body: "Paste the brief numbers — rate, usage, exclusivity window — and get a fair-market figure formatted straight into the ledger. No formula surgery.",
    },
    {
      icon: LayoutDashboard,
      label: "Command",
      title: "Unified Hub Dashboard",
      body: "One screen calls the whole ledger home: balances, monthly totals, and tax posture. You open the file and already know your position.",
    },
  ];

  const secondaries = [
    {
      icon: ChartColumn,
      label: "Attribution",
      title: "Income Per Platform",
      body: "YouTube, Patreon, sponsorships — every stream keeps its own clean line, rollable into one honest total.",
    },
    {
      icon: ReceiptText,
      label: "Cashflow",
      title: "Invoice Tracker",
      body: "Payments in, invoices out, and the did-they-pay-yet column that answers it. Chasing money finally has a home.",
    },
  ];

  return (
    <section className="border-t border-hairline py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          code="[ 03 / The System ]"
          title="A ledger that behaves like a product."
          intro="Three flagship systems carry the engine. Two supporting strips keep the books complete end to end."
        />
        <div className="border border-hairline">
          <div className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x">
            {flagships.map((feature) => (
              <article key={feature.title} className="p-10 md:p-12">
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
                    {feature.label}
                  </p>
                  <feature.icon
                    className="text-bone/70"
                    size={20}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-bone/60">{feature.body}</p>
              </article>
            ))}
          </div>
          <div className="grid grid-cols-1 divide-y divide-hairline border-t border-hairline md:grid-cols-3 md:divide-x">
            {secondaries.map((feature) => (
              <article key={feature.title} className="p-10 md:p-12">
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
                    {feature.label}
                  </p>
                  <feature.icon
                    className="text-bone/70"
                    size={20}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-bone/60">{feature.body}</p>
              </article>
            ))}
            <article className="p-10 md:p-12">
              <div className="border-b border-hairline pb-4">
                <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
                  The Bottom Line
                </p>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-tight">
                Just get it.
              </h3>
              <p className="mt-4 text-bone/60">
                No account. No email gate. One click puts the whole system on
                your own Drive, ready to name and own.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandOffMatrix() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  async function copyLink() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(TEMPLATE_COPY_URL);
      ok = true;
    } catch {
      ok = legacyCopy(TEMPLATE_COPY_URL);
    }
    if (ok) {
      setCopied(true);
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="border-t border-hairline py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          code="[ 04 / Access ]"
          title="Take the template."
          intro="Your own filtered copy, live inside your Drive in one click. Structure that holds, columns you actually own."
        />
        <div className={`flex flex-col gap-6 border p-8 md:flex-row md:items-center md:justify-between md:p-10 transition-colors duration-200 motion-reduce:transition-none ${copied ? "border-bone" : "border-hairline"}`}>
          <div className="min-w-0">
            {copied ? (
              <span className="inline-flex items-center gap-2 bg-bone font-mono text-xs uppercase tracking-wider text-matte px-3 py-1">
                TOKEN_COPIED // ACCESS_READY
              </span>
            ) : (
              <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
                Access Link · One-time
              </p>
            )}
            <p className="mt-3 truncate font-mono text-xs text-bone/70 md:text-sm">
              {TEMPLATE_COPY_URL}
            </p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy template access link to clipboard"
            aria-live="polite"
            className={`inline-flex shrink-0 items-center justify-center gap-3 border px-8 py-4 font-mono text-xs uppercase tracking-wider transition-colors duration-200 motion-reduce:transition-none hover:border-bone hover:bg-bone hover:text-matte ${copied ? "border-bone text-bone" : "border-hairline"}`}
          >
            {copied ? (
              <>
                <Check size={16} strokeWidth={1.5} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} strokeWidth={1.5} />
                Copy Access Link
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <p className="font-mono text-sm tracking-wide text-bone">
          Built on Google Sheets. Looks nothing like it.
        </p>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
            Designed for independent creators · Hand-built with zero
            dependencies
          </p>
          <p className="font-mono text-xs uppercase tracking-wider text-bone/50">
            © 2026 Creator Ledger
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-matte text-bone">
      <Hero />
      <PainPointMatrix />
      <FeatureGrid />
      <HandOffMatrix />
      <Footer />
    </main>
  );
}