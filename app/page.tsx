import Link from "next/link";
import { PiggyBank, ShieldCheck, Wallet } from "lucide-react";
import LandingNav from "@/components/landing-nav";
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

const FAQ = [
  {
    question: "Do I need an accountant to use Set-Aside?",
    answer:
      "No. Set-Aside is built for the self-employed who want one honest number without building spreadsheets.",
  },
  {
    question: "How is the tax set-aside calculated?",
    answer:
      "You pick a percentage (23% is a common default). Each positive period sets that share aside automatically, so you always know what you owe.",
  },
  {
    question: "Is my financial data private?",
    answer:
      "Your data belongs to you. It lives behind your account, and every ledger row is protected — there are no shared documents.",
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

function Eyebrow({ children }: { children: string }) {
  return <p className={`${type.caps} ${palette.ctaText}`}>{children}</p>;
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className={`mt-4 ${type.section2} ${palette.text}`}>{children}</h2>;
}

export default function Home() {
  return (
    <main className={`${recipe.page} ${palette.canvas}`}>
      <LandingNav />

      <div className={`${space.containerLg} pb-16`}>
        <section className="max-w-3xl pb-16 pt-14 sm:pt-20">
          <Eyebrow>A calm money dashboard for the self-employed</Eyebrow>
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
              <p className={`mt-2 ${type.statNumber} ${palette.text}`}>{NET}</p>
            </div>
            <div>
              <p className={`${type.caps} ${palette.textGhost}`}>Tax set-aside</p>
              <p className={`mt-2 ${type.statNumber} ${palette.text}`}>{TAX}</p>
            </div>
            <div>
              <p className={`${type.caps} ${palette.textGhost}`}>Money in</p>
              <p className={`mt-2 ${type.statNumber} ${palette.gainText}`}>{IN}</p>
            </div>
          </div>
          <p className={`mt-6 text-xs ${palette.textGhost}`}>
            Illustrative figures — your numbers live behind a login.
          </p>
        </section>

        <section id="features" className="scroll-mt-24 py-16 sm:py-20">
          <Eyebrow>Why Set-Aside</Eyebrow>
          <SectionTitle>Built around the three numbers you should care about</SectionTitle>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className={`bg-white p-6 dark:bg-gray-900`}>
                <feature.icon size={18} strokeWidth={2} className={palette.textGhost} />
                <h3 className={`mt-4 ${type.sectionTitle} ${palette.text}`}>{feature.title}</h3>
                <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="scroll-mt-24 pb-16 sm:pb-20">
          <Eyebrow>The dashboard</Eyebrow>
          <SectionTitle>One screen, always up to date</SectionTitle>
          <div className={`mt-8 ${recipe.surface} p-6 sm:p-8`}>
            <div className="flex items-center justify-between">
              <span className={`${type.brand} ${palette.text}`}>Set-Aside</span>
              <span className={`${type.tiny} ${palette.textGhost}`}>September 2026</span>
            </div>
            <div className="mt-6 grid items-end gap-8 sm:grid-cols-[1fr_auto]">
              <div>
                <p className={`${type.caps} ${palette.textGhost}`}>Net Position</p>
                <p className={`mt-2 ${type.heroNumber} ${palette.text}`}>{NET}</p>
                <div className={`mt-8 grid gap-6 sm:grid-cols-3`}>
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
              <svg
                viewBox="0 0 200 80"
                className="mb-1 h-24 w-full text-gray-300 dark:text-gray-700 sm:w-48"
                aria-hidden
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,62 20,55 40,58 60,42 80,46 100,30 120,34 140,20 160,26 180,12 200,16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 pb-16 sm:pb-20">
          <Eyebrow>Getting started</Eyebrow>
          <SectionTitle>Three steps from signup to your numbers</SectionTitle>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <span className={`font-display text-3xl font-semibold ${palette.textGhost}`}>
                  0{i + 1}
                </span>
                <h3 className={`mt-3 ${type.heading} ${palette.text}`}>{step.title}</h3>
                <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 pb-16 sm:pb-20">
          <Eyebrow>FAQ</Eyebrow>
          <SectionTitle>Questions, answered</SectionTitle>
          <div className="mt-8 space-y-3">
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

        <section className="pb-16 sm:pb-20">
          <div className={recipe.ctaPanel}>
            <h2 className={`mx-auto max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] ${palette.text}`}>
              Your money life, finally in one number.
            </h2>
            <p className={`mx-auto mt-4 max-w-md text-sm ${palette.textMuted}`}>
              Free to try. A magic link is all it takes to see your Net Position.
            </p>
            <Link href="/login" className={`${recipe.btnPrimaryLg} mt-8 inline-block px-6 py-3`}>
              Get started
            </Link>
          </div>
        </section>

        <footer className={`border-t py-10`}>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className={`${type.brand} ${palette.text}`}>Set-Aside</p>
              <p className={`mt-2 max-w-xs text-sm leading-relaxed ${palette.textSubtle}`}>
                A calm money dashboard for the self-employed.
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
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className={`mt-10 text-xs ${palette.textGhost}`}>
            © 2026 Set-Aside. Illustrative figures on this page.
          </p>
        </footer>
      </div>
    </main>
  );
}