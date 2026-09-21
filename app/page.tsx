import Link from "next/link";
import { palette, radius, recipe, space, type } from "@/lib/tokens";

const FEATURES = [
  {
    title: "Your Net Position, at a glance",
    body: "Money in and money out, summed into one number you can trust — with a trendline, not a grid.",
  },
  {
    title: "Tax set-aside, separated automatically",
    body: "A percentage of every positive period is set aside the moment the numbers land. No formulas to build.",
  },
  {
    title: "Private by construction",
    body: "Real accounts, your data belongs to you, and every row is protected. There are no shared documents.",
  },
];

const STEPS = [
  {
    title: "Sign up in seconds",
    body: "Google or email. No company setup, no accounting jargon.",
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

export default function Home() {
  return (
    <main className={`${recipe.page} ${space.containerLg} ${type.text}`}>
      <header className={`flex items-center justify-between py-6 ${palette.border}`}>
        <span className={type.heading + " " + palette.text}>Set-Aside</span>
        <Link href="/login" className={recipe.btnGhostLg}>
          Log in
        </Link>
      </header>

      <section className="py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className={`text-4xl font-bold tracking-tight sm:text-5xl ${palette.text}`}>
            Do you have money? Is the tax set aside?
          </h1>
          <p className={`mt-5 text-lg ${palette.textSubtle}`}>
            Set-Aside is a money dashboard for the self-employed. You record
            money in and money out; it shows your Net Position, separates a
            tax set-aside for you, and keeps a clean category breakdown.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className={recipe.btnPrimaryLg + " px-6 py-3"}>
              Get started
            </Link>
            <a href="#how-it-works" className={recipe.btnGhostLg + " px-6 py-3"}>
              How it works
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className={`${radius.card} ${palette.border} ${palette.surface} p-5`}>
            <h2 className={type.sectionTitle + " " + palette.text}>{feature.title}</h2>
            <p className={`mt-2 ${type.text} ${palette.textSubtle}`}>{feature.body}</p>
          </div>
        ))}
      </section>

      <section id="how-it-works" className="py-16 sm:py-20">
        <h2 className={`text-2xl font-semibold tracking-tight ${palette.text}`}>
          Three steps from signup to your numbers
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className={`${palette.inkSoft} rounded-2xl p-5`}>
              <span className={`${type.sectionTitle} ${palette.textGhost}`}>0{i + 1}</span>
              <h3 className={`mt-2 ${type.sectionTitle} ${palette.text}`}>{step.title}</h3>
              <p className={`mt-2 ${type.text} ${palette.textSubtle}`}>{step.body}</p>
            </div>
          ))}
        </div>
        <div className={`${space.stack} mt-10 text-center`}>
          <Link href="/login" className={recipe.btnPrimaryLg + " px-6 py-3"}>
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