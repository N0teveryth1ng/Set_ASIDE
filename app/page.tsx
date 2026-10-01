import Link from "next/link";
import { Database, FileUp, Percent, PiggyBank, ShieldCheck, Wallet } from "lucide-react";
import LandingNav from "@/components/landing-nav";
import { AuthCtaProvider, FooterAuthCtas, SignupCta } from "@/components/auth-cta";
import { BrandMark } from "@/components/brand-mark";
import { palette, recipe, space, type } from "@/lib/tokens";

const FEATURES = [
  {
    title: "Net Position, at a glance",
    body: "Money in and money out, summed into one number you can trust — with a trendline, not a grid.",
    icon: Wallet,
  },
  {
    title: "Tax set-aside, separated automatically",
    body: "Pick a flat percentage (23% is a common default); every positive period sets that share aside on its own. A savings habit, not a tax calculation.",
    icon: PiggyBank,
  },
  {
    title: "Private by construction",
    body: "Real accounts on Supabase Postgres — no shared documents, no browser-only data. Row-level security guards every owned row.",
    icon: ShieldCheck,
  },
];

const TRUST = [
  {
    title: "Real data, tied to your account",
    body: "Your numbers live in a real database behind your login — Supabase Postgres, not a browser-only tab. They are never shared and never sold.",
    icon: Database,
  },
  {
    title: "A set-aside you set, not a tax engine",
    body: "It is a flat percentage you choose and change anytime, separated on every positive period. Set-Aside is not a bracket or jurisdiction calculation — it never claims to be.",
    icon: Percent,
  },
  {
    title: "Import happens once",
    body: "Upload a spreadsheet and it is converted into normal entries. The app then reads its own database only and never re-opens or syncs the original file.",
    icon: FileUp,
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

const FAQ = [
  {
    question: "Do I need an accountant to use Set-Aside?",
    answer:
      "No. Set-Aside is built for the self-employed who want one honest number without building spreadsheets.",
  },
  {
    question: "How is the tax set-aside calculated?",
    answer:
      "It isn't calculated like a tax return. You choose a flat percentage (23% is a common default), and Set-Aside separates that share on every positive period so you always know what to set aside. It's a savings discipline, not a bracket or jurisdiction calculation.",
  },
  {
    question: "Is my financial data private?",
    answer:
      "Your data lives behind your account in Supabase Postgres, protected by row-level security, and it is never shared or sold. There are no shared documents.",
  },
  {
    question: "What if a month has more out than in?",
    answer:
      "Your Net Position reflects the real number, and the set-aside only accrues on positive periods. Nothing is hidden.",
  },
  {
    question: "Can I change the tax rate or categories later?",
    answer:
      "Anytime, in Settings. Categories, rate, currency, and which cards you see are all yours to adjust.",
  },
];

const NET = "+$5,333.00";
const IN = "+$5,500.00";
const OUT = "−$167.00";
const TAX = "$1,203.00";

const CATEGORIES = [
  { name: "Clients", amount: "+$4,120", pct: 100 },
  { name: "Travel", amount: "−$890", pct: 66 },
  { name: "Software", amount: "−$310", pct: 46 },
  { name: "Gear", amount: "−$180", pct: 30 },
  { name: "Meals", amount: "−$120", pct: 22 },
];

function Eyebrow({ children }: { children: string }) {
  return <p className={`${type.caps} ${palette.ctaText}`}>{children}</p>;
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className={`mt-4 ${type.section2} ${palette.text}`}>{children}</h2>;
}

function SectionCopy({ children }: { children: string }) {
  return <p className={`mt-4 max-w-2xl ${type.text} leading-relaxed ${palette.textSubtle}`}>{children}</p>;
}

function Trendline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} aria-hidden preserveAspectRatio="none">
      <polyline
        points="0,62 20,55 40,58 60,42 80,46 100,30 120,34 140,20 160,26 180,12 200,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={`${recipe.page} ${palette.canvas}`}>
      <AuthCtaProvider>
        <LandingNav />

        <div className={`${space.containerLg} pb-16`}>
          <section className="max-w-3xl pt-16 pb-12 sm:pt-24">
            <Eyebrow>A calm money dashboard for the self-employed</Eyebrow>
            <h1 className={`mt-6 ${type.displayJumbo} ${palette.text}`}>
              Do you have money?
              <br />
              Is the tax set aside?
            </h1>
            <p className={`mt-7 max-w-2xl text-lg leading-relaxed ${palette.textSubtle}`}>
              Set-Aside is a money dashboard for the self-employed. You record
              money in and money out; it shows your Net Position, separates a
              set-aside for you, and keeps a clean category breakdown —
              trendline, not a grid.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <SignupCta className="px-6 py-3" />
              <a href="#how-it-works" className={`${recipe.btnGhostLg} px-6 py-3`}>
                How it works
              </a>
            </div>
          </section>

          <section aria-label="Example dashboard" className="pb-16 sm:pb-20">
            <div
              className={`${recipe.surface} overflow-hidden p-6 ring-1 ring-inset ring-black/5 dark:ring-white/5 sm:p-10`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                  <BrandMark className="h-4 w-4" />
                  Set-Aside
                </span>
                <span className={`${type.tiny} ${palette.textGhost}`}>
                  September 2026 · Illustrative
                </span>
              </div>
              <div className="mt-8 grid items-end gap-10 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className={`${type.caps} ${palette.textGhost}`}>Net Position</p>
                  <p className={`mt-2 ${type.heroNumber} ${palette.text}`}>{NET}</p>
                  <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Money in</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.gainText}`}>{IN}</p>
                    </div>
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Money out</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.lossText}`}>{OUT}</p>
                    </div>
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Tax set-aside</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.text}`}>{TAX}</p>
                    </div>
                  </div>
                </div>
                <Trendline className="mb-1 h-28 w-full text-gray-300 dark:text-gray-700 sm:w-56" />
              </div>
            </div>
            <p className={`mt-4 text-xs ${palette.textGhost}`}>
              Illustrative figures — your numbers live behind a login.
            </p>
          </section>

          <section id="trust" className="scroll-mt-24 pb-20 sm:pb-24">
            <Eyebrow>Straight answers</Eyebrow>
            <SectionTitle>How Set-Aside really works</SectionTitle>
            <SectionCopy>
              A few things, said plainly — so you know exactly what you're signing up for.
            </SectionCopy>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
              {TRUST.map((item) => (
                <div key={item.title} className={`p-7 ${palette.surface}`}>
                  <item.icon size={18} strokeWidth={2} className={palette.ctaText} />
                  <h3 className={`mt-5 ${type.sectionTitle} ${palette.text}`}>{item.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="features" className="scroll-mt-24 pb-20 sm:pb-24">
            <Eyebrow>Why Set-Aside</Eyebrow>
            <SectionTitle>Built around the three numbers you should care about</SectionTitle>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className={`p-7 ${palette.surface}`}>
                  <feature.icon size={18} strokeWidth={2} className={palette.textGhost} />
                  <h3 className={`mt-5 ${type.sectionTitle} ${palette.text}`}>{feature.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="product" className="scroll-mt-24 pb-20 sm:pb-24">
            <Eyebrow>The dashboard</Eyebrow>
            <SectionTitle>One screen, always up to date</SectionTitle>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div
                className={`${recipe.surface} p-6 ring-1 ring-inset ring-black/5 dark:ring-white/5 sm:p-8`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                    <BrandMark className="h-4 w-4" />
                    Set-Aside
                  </span>
                  <span className={`${type.tiny} ${palette.textGhost}`}>Overview · Illustrative</span>
                </div>
                <div className="mt-8">
                  <p className={`${type.caps} ${palette.textGhost}`}>Net Position</p>
                  <p className={`mt-2 ${type.heroNumber} ${palette.text}`}>{NET}</p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-3">
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Money in</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.gainText}`}>{IN}</p>
                    </div>
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Money out</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.lossText}`}>{OUT}</p>
                    </div>
                    <div>
                      <p className={`${type.tiny} ${palette.textGhost}`}>Tax set-aside</p>
                      <p className={`mt-1 text-lg font-semibold tabular-nums ${palette.text}`}>{TAX}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t pt-6">
                  <p className={`${type.tiny} ${palette.textGhost}`}>
                    Money in · Money out · Tax set-aside all live on one screen.
                  </p>
                </div>
              </div>

              <div className={`${recipe.surface} p-6 ring-1 ring-inset ring-black/5 dark:ring-white/5 sm:p-8`}>
                <div className="flex items-center justify-between">
                  <p className={`${type.sectionTitle} ${palette.text}`}>Category breakdown</p>
                  <span className={`${type.tiny} ${palette.textGhost}`}>Illustrative</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.name}>
                      <div className="flex items-baseline justify-between">
                        <span className={`${type.text} font-medium ${palette.textMuted}`}>{cat.name}</span>
                        <span className={`${type.text} font-semibold tabular-nums ${
                          cat.amount.startsWith("+") ? palette.gainText : palette.text
                        }`}>
                          {cat.amount}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${palette.ctaBar}`}
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="scroll-mt-24 pb-20 sm:pb-24">
            <Eyebrow>Getting started</Eyebrow>
            <SectionTitle>Three steps from signup to your numbers</SectionTitle>
            <div className="mt-10 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title}>
                  <span className={`font-display text-4xl font-semibold ${palette.textGhost}`}>
                    0{i + 1}
                  </span>
                  <h3 className={`mt-4 ${type.heading} ${palette.text}`}>{step.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 pb-20 sm:pb-24">
            <Eyebrow>FAQ</Eyebrow>
            <SectionTitle>Questions, answered</SectionTitle>
            <div className="mt-10 space-y-3">
              {FAQ.map((item) => (
                <details key={item.question} className={recipe.faqRow}>
                  <summary className={`cursor-pointer ${type.sectionTitle} ${palette.text}`}>
                    {item.question}
                  </summary>
                  <p className={`mt-3 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="pb-20 sm:pb-24">
            <div className={recipe.ctaPanel}>
              <h2 className={`mx-auto max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] ${palette.text}`}>
                Your money life, finally in one number.
              </h2>
              <p className={`mx-auto mt-4 max-w-md text-sm ${palette.textMuted}`}>
                Free to try. A magic link is all it takes to see your Net Position.
              </p>
              <SignupCta className="mt-8 inline-block px-6 py-3" />
            </div>
          </section>

          <footer className={`border-t py-12`}>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                  <BrandMark className="h-4 w-4" />
                  Set-Aside
                </p>
                <p className={`mt-2 max-w-xs text-sm leading-relaxed ${palette.textSubtle}`}>
                  A calm money dashboard for the self-employed. Your data lives in a real
                  database behind your account — never shared, never sold.
                </p>
              </div>
              <div>
                <p className={`${type.caps} ${palette.textGhost}`}>Product</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    { href: "#features", label: "Features" },
                    { href: "#how-it-works", label: "How it works" },
                    { href: "#faq", label: "FAQ" },
                  ].map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={`${type.caps} ${palette.textGhost}`}>Account</p>
                <FooterAuthCtas />
              </div>
            </div>
            <p className={`mt-10 text-xs ${palette.textGhost}`}>
              © 2026 Set-Aside. Illustrative figures on this page.
            </p>
          </footer>
        </div>
      </AuthCtaProvider>
    </main>
  );
}