import { Database, FileUp, Percent, PiggyBank, ShieldCheck, Wallet } from "lucide-react";
import LandingNav from "@/components/landing-nav";
import { AuthCtaProvider, FooterAuthCtas, SignupCta } from "@/components/auth-cta";
import { BrandMark } from "@/components/brand-mark";
import { palette, recipe, space, type } from "@/lib/tokens";

const FEATURES = [
  {
    title: "One number, what is actually yours",
    body: "Money in minus money out, on one screen. This is what you can spend without touching the tax you owe.",
    icon: Wallet,
  },
  {
    title: "The set-aside moves on its own",
    body: "You pick a percentage and every good month separates that share. It does the part you forget to do.",
    icon: PiggyBank,
  },
  {
    title: "It never asks for your bank",
    body: "No login, no connection, no account at any bank you use. You record the money yourself and nothing is taken from you.",
    icon: ShieldCheck,
  },
];

const TRUST = [
  {
    title: "Your rows belong to you alone",
    body: "Every record is tied to your account, and no one else can reach it. We do not sell it. We do not share it.",
    icon: Database,
  },
  {
    title: "It moves your percentage, nothing more",
    body: "You choose the number and you can change it whenever you want. Set-Aside does not work out your tax bill and does not pretend to.",
    icon: Percent,
  },
  {
    title: "The spreadsheet import happens once",
    body: "Upload it and it turns into normal records. After that Set-Aside reads its own database and never reopens the file.",
    icon: FileUp,
  },
];

const STEPS = [
  {
    title: "Sign in with a magic link",
    body: "An email link gets you in. There is no password to forget or leak.",
  },
  {
    title: "Pick your kind of work",
    body: "Freelance, business, personal or creator. Your categories fill themselves in.",
  },
  {
    title: "Add money, or bring what you already have",
    body: "Type one entry, or import months of history in a single go.",
  },
];

const FAQ = [
  {
    question: "Does Set-Aside connect to my bank?",
    answer:
      "No, and there is no code in the product that could. There is no bank login, no Plaid, no open banking connection. You type your entries in or import a spreadsheet once. Nothing is pulled from your accounts by us.",
  },
  {
    question: "How is the set-aside worked out?",
    answer:
      "You pick a percentage. Twenty-three percent is a common starting point. On every period where money in beats money out, that share is separated for you. The percentage is yours to change at any time. Set-Aside does not know your bracket and does not work out your tax bill.",
  },
  {
    question: "Do I need an accountant to use this?",
    answer:
      "To keep a spreadsheet you do not. If you have a complicated situation, an accountant is still the right person and we will say so. This is a place to see the number, not a replacement for advice.",
  },
  {
    question: "What happens in a month where I spend more than I earn?",
    answer:
      "The number turns red and stays honest. The set-aside only grows on positive periods, because there is no profit in a losing month to set aside from.",
  },
  {
    question: "Where is my data, and can I get it out?",
    answer:
      "Behind your login, in a real database, where only your account can reach it. You can download every entry as CSV from Settings at any time, in any date range. Leaving should never be harder than joining.",
  },
  {
    question: "Can I change the percentage or my categories later?",
    answer:
      "Any time, in Settings. Percentage, categories, currency and which cards you see are all yours to adjust.",
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
  return <span className={recipe.eyebrow}>{children}</span>;
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={`mt-5 ${type.section2} ${palette.text}`}>{title}</h2>
      {copy && (
        <p className={`mx-auto mt-4 max-w-xl ${type.text} leading-relaxed ${palette.textSubtle}`}>
          {copy}
        </p>
      )}
    </div>
  );
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

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function Home() {
  return (
    <main className={`${recipe.page} ${palette.canvas}`}>
      <AuthCtaProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
        />
        <LandingNav />

        <section className={`border-b ${palette.border} ${palette.heroTint}`}>
          <div className={`${space.containerLg} pb-16 pt-16 text-center sm:pb-20 sm:pt-20`}>
            <Eyebrow>For freelancers and contractors</Eyebrow>
            <h1 className={`mx-auto mt-6 max-w-3xl ${type.displayHero} ${palette.text}`}>
              Know what is <span className={palette.ctaText}>yours</span>, and
              what is the <span className={palette.ctaText}>tax you owe</span>.
            </h1>
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed ${palette.textSubtle}`}>
              Set-Aside is for freelancers whose income changes month to month.
              Record money in and out. It tells you what you can actually spend,
              and moves the tax share aside the day you get paid. It never asks
              for your bank login.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <SignupCta variant="hero" />
              <a href="#how-it-works" className={recipe.btnHeroGhost}>
                How it works
              </a>
            </div>
          </div>
        </section>

        <section aria-label="Example dashboard" className="pb-16 sm:pb-24">
          <div className={`${space.containerLg} pt-14 sm:pt-20`}>
            <div className={recipe.mockPanel}>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                  <BrandMark className="h-4 w-4" />
                  Set-Aside
                </span>
                <span className={`${type.tiny} ${palette.textGhost}`}>
                  September 2026 · Illustrative
                </span>
              </div>
              <div className="mt-10 grid items-end gap-10 sm:grid-cols-[1.2fr_auto]">
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
              Illustrative figures. Your own numbers sit behind your login.
            </p>
          </div>
        </section>

        <section id="trust" className="scroll-mt-24 pb-20 sm:pb-24">
          <div className={space.containerLg}>
            <SectionHeading
              eyebrow="Straight answers"
              title="What it does, and what it refuses to do"
              copy="So you know what you are signing up for before you do."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {TRUST.map((item) => (
                <div key={item.title} className={`${recipe.surfaceCard} p-7`}>
                  <span className={recipe.iconTile}>
                    <item.icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className={`mt-6 ${type.sectionTitle} ${palette.text}`}>{item.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 pb-20 sm:pb-24">
          <div className={space.containerLg}>
            <SectionHeading eyebrow="How it works" title="Two numbers, and they disagree more than you think" />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className={`${recipe.surfaceCard} p-7`}>
                  <span className={recipe.iconTile}>
                    <feature.icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className={`mt-6 ${type.sectionTitle} ${palette.text}`}>{feature.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="scroll-mt-24 pb-20 sm:pb-24">
          <div className={space.containerLg}>
            <SectionHeading eyebrow="The dashboard" title="One screen, and it is always current" />
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className={`${recipe.surfaceCard} p-6 sm:p-8`}>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                    <BrandMark className="h-4 w-4" />
                    Set-Aside
                  </span>
                  <span className={`${type.tiny} ${palette.textGhost}`}>Overview · Illustrative</span>
                </div>
                <div className="mt-10">
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

              <div className={`${recipe.surfaceCard} p-6 sm:p-8`}>
                <div className="flex items-center justify-between">
                  <p className={`${type.sectionTitle} ${palette.text}`}>Category breakdown</p>
                  <span className={`${type.tiny} ${palette.textGhost}`}>Illustrative</span>
                </div>
                <ul className="mt-6 space-y-5">
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
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 pb-20 sm:pb-24">
          <div className={space.containerLg}>
            <SectionHeading eyebrow="Getting started" title="Three steps and you have numbers" />
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="text-center">
                  <span className={`mx-auto ${recipe.stepChip}`}>0{i + 1}</span>
                  <h3 className={`mt-5 ${type.heading} ${palette.text}`}>{step.title}</h3>
                  <p className={`mt-2 ${type.text} leading-relaxed ${palette.textSubtle}`}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 pb-20 sm:pb-24">
          <div className={space.containerLg}>
            <SectionHeading eyebrow="FAQ" title="Questions worth asking" />
            <div className="mt-12 space-y-3">
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
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <div className={`${space.containerLg}`}>
            <div className={recipe.ctaPanelBig}>
            <h2 className={`mx-auto max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] ${palette.text}`}>
              Find out what is{" "}
              <span className={palette.ctaText}>yours</span>.
            </h2>
            <p className={`mx-auto mt-4 max-w-md text-sm ${palette.textMuted}`}>
              A magic link gets you in. Your first entry takes about ten
              seconds, and we never ask for a bank login.
            </p>
            <div className="mt-8">
              <SignupCta variant="hero" />
            </div>
            </div>
          </div>
        </section>

        <footer className={`border-t py-12`}>
          <div className={space.containerLg}>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
                  <BrandMark className="h-4 w-4" />
                  Set-Aside
                </p>
                <p className={`mt-2 max-w-xs text-sm leading-relaxed ${palette.textSubtle}`}>
                  A money dashboard for freelancers. Your records sit behind your own
                  login where no one else can read them, and you can take
                  them out as CSV whenever you want.
                </p>
              </div>
              <div>
                <p className={`${type.caps} ${palette.textGhost}`}>Product</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    { href: "#features", label: "Features" },
                    { href: "#how-it-works", label: "How it works" },
                    { href: "#faq", label: "FAQ" },
                    { href: "/works-on-every-device", label: "How your data is stored" },
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
          </div>
        </footer>
      </AuthCtaProvider>
    </main>
  );
}