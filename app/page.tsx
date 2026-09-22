import Link from "next/link";
import { PiggyBank, ShieldCheck, Wallet } from "lucide-react";
import { palette, recipe, space, type } from "@/lib/tokens";

const FEATURES = [
  {
    title: "Your Net Position, at a glance",
    body: "Money in and money out, summed into one number you can trust — with a trendline, not a grid.",
    icon: Wallet,
  },
  {
    title: "Tax set-aside, separated automatically",
    body: "A percentage of every positive period is set aside the moment the numbers land. No formulas to build.",
    icon: PiggyBank,
  },
  {
    title: "Private by construction",
    body: "Real accounts, your data belongs to you, and every row is protected. There are no shared documents.",
    icon: ShieldCheck,
  },
];

const STEPS = [
  {
    title: "Sign up in seconds",
    body: "A magic link is all it takes. No company setup, no accounting jargon.",
  },
  {
    title: "Pick your money life",
    body: "Freelance, business, personal, or creator — categories seed themselves.",
  },
  {
    title: "Start recording",
    body: "Add an entry in plain language or import months of history. Everything updates itself.",
  },
];

const MONTH_NET = "+$5,333";
const MONTH_TAX = "$1,203";
const MONTH_IN = "+$5,500";

export default function Home() {
  return (
    <main className={`${recipe.page} ${space.containerLg}`}>
      <header className="flex items-center justify-between py-6">
        <span className={`${type.brand} ${palette.text}`}>Set-Aside</span>
        <Link href="/login" className={recipe.btnGhostLg}>
          Log in
        </Link>
      </header>

      <section className="max-w-3xl pb-16 pt-12 sm:pt-16">
        <p className={`${type.caps} ${palette.ctaText}`}>
          A calm money dashboard for the self-employed
        </p>
        <h1 className={`mt-5 ${type.displayHero} ${palette.text}`}>
          Do you have money?
          <br />
          Is the tax set aside?
        </h1>
        <p className={`mt-6 max-w-xl text-lg leading-relaxed ${palette.textSubtle}`}>
          Set-Aside is a money dashboard for the self-employed. You record
          money in and money out; it shows your Net Position, separates a tax
          set-aside for you, and keeps a clean category breakdown.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/login" className={`${recipe.btnPrimaryLg} px-6 py-3`}>
            Get started
          </Link>
          <a href="#how-it-works" className={`${recipe.btnGhostLg} px-6 py-3`}>
            How it works
          </a>
        </div>
      </section>

      <section aria-label="Example numbers" className="border-y py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className={`${type.caps} ${palette.textGhost}`}>Net Position</p>
            <p className={`mt-2 font-display text-4xl font-semibold tracking-[-0.02em] tabular-nums ${palette.text}`}>
              {MONTH_NET}
            </p>
          </div>
          <div>
            <p className={`${type.caps} ${palette.textGhost}`}>Tax set-aside</p>
            <p className={`mt-2 font-display text-4xl font-semibold tracking-[-0.02em] tabular-nums ${palette.text}`}>
              {MONTH_TAX}
            </p>
          </div>
          <div>
            <p className={`${type.caps} ${palette.textGhost}`}>Money in</p>
            <p className={`mt-2 font-display text-4xl font-semibold tracking-[-0.02em] tabular-nums ${palette.gainText}`}>
              {MONTH_IN}
            </p>
          </div>
        </div>
        <p className={`mt-6 text-xs ${palette.textGhost}`}>
          Illustrative figures — your numbers live behind a login.
        </p>
      </section>

      <section className="py-16 sm:py-20">
        <div className="grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className={`bg-white p-6`}>
              <feature.icon size={18} strokeWidth={2} className={palette.textGhost} />
              <h2 className={`mt-4 ${type.sectionTitle} ${palette.text}`}>{feature.title}</h2>
              <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="pb-16 sm:pb-20">
        <h2 className={`font-display text-3xl font-semibold tracking-[-0.02em] ${palette.text}`}>
          Three steps from signup to your numbers
        </h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <span className={`font-display text-3xl font-semibold ${palette.textGhost}`}>
                0{i + 1}
              </span>
              <h3 className={`mt-3 ${type.heading} ${palette.text}`}>{step.title}</h3>
              <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>{step.body}</p>
            </div>
          ))}
        </div>
        <div className={`mt-12 text-center`}>
          <Link href="/login" className={`${recipe.btnPrimaryLg} px-6 py-3`}>
            Start with Set-Aside
          </Link>
        </div>
      </section>

      <footer className={`border-t py-8 text-sm ${palette.border} ${palette.textGhost}`}>
        <p>© 2026 Set-Aside.</p>
      </footer>
    </main>
  );
}