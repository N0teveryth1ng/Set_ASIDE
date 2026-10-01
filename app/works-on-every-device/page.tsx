import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { AuthCtaProvider, SignupCta } from "@/components/auth-cta";
import { palette, recipe, space, type } from "@/lib/tokens";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://set-aside-nine.vercel.app";
const PATH = "/works-on-every-device";

export const metadata: Metadata = {
  title: "Budgeting apps that lose your data when you clear your cache",
  description:
    "Browser-stored budget apps tie your records to one computer and one browser profile. What that actually breaks, and what to check before you trust one with your numbers.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: PATH,
    siteName: "Set-Aside",
    title: "Budgeting apps that lose your data when you clear your cache",
    description:
      "Most apps that avoid bank logins store your records on one computer. Here is what that costs you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Budgeting apps that lose your data when you clear your cache",
    description:
      "Most apps that avoid bank logins store your records on one computer. Here is what that costs you.",
  },
};

const COMPETITORS = [
  {
    name: "FinoraDesk",
    url: "https://finoradesk.com",
    quote: "Business mode is a one-time $40 purchase for one computer.",
    point: "One machine. Their business mode is sold per computer.",
  },
  {
    name: "DayTrak",
    url: "https://daytrak.app",
    quote: "$19 one-time Pro upgrade adds multi-device sync and encrypted cloud backup.",
    point: "Sync is the paid upgrade, so the free tier is one device by design.",
  },
  {
    name: "Fintrack",
    url: "https://fintrack-app.com",
    quote: "A one-time purchase desktop app, macOS and Windows.",
    point: "Desktop only. No phone, no tablet, no second computer.",
  },
  {
    name: "TaliiVue",
    url: "https://taliivue.com",
    quote: "The file is saved wherever you save files: Documents, Desktop, a drive you choose.",
    point: "A file in one folder on one computer. Good until that computer dies.",
  },
];

const CHECKS = [
  {
    q: "Can I open my records on a phone?",
    a: "If the vendor only sells a desktop app or a one-computer licence, the honest answer is no. That is a real limit for anyone who checks their numbers away from a desk.",
  },
  {
    q: "Where are my records actually stored?",
    a: "Browser storage means they live in one browser profile on one machine. Clearing site data, switching browsers, or reinstalling the OS can take them with it. The vendor cannot warn you, because the deletion happens outside their app.",
  },
  {
    q: "Is there an account, or just a file?",
    a: "If it is just a file, who backs it up? If it is an account, who can reach it, and what happens to the data if you stop paying?",
  },
  {
    q: "Can I leave with everything?",
    a: "Before you type anything in, look for a CSV export. If getting your data out needs a support email, treat that as a warning about what happens if the vendor changes direction.",
  },
  {
    q: "What happens when the price changes?",
    a: "A tool you rely on every month should let you take your history somewhere else. Local files travel. Accounts can be frozen.",
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Budgeting apps that lose your data when you clear your cache",
  description:
    "Browser-stored budget apps tie your records to one computer and one browser profile. What that actually breaks, and what to check before you trust one with your numbers.",
  datePublished: "2026-10-01",
  dateModified: "2026-10-01",
  author: { "@type": "Organization", name: "Set-Aside" },
  publisher: { "@type": "Organization", name: "Set-Aside" },
  mainEntityOfPage: `${SITE_URL}${PATH}`,
};

function H2({ children }: { children: string }) {
  return (
    <h2
      className={`mt-14 font-display text-2xl font-semibold tracking-[-0.02em] ${palette.text} sm:text-3xl`}
    >
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className={`mt-5 text-lg leading-[1.75] ${palette.textSubtle}`}>{children}</p>
  );
}

export default function WorksOnEveryDevicePage() {
  return (
    <main className={recipe.page}>
      <AuthCtaProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
        />

        <div className={`border-b ${palette.border}`}>
          <div className={space.containerMd}>
            <div className="py-6">
              <Link
                href="/"
                className={`flex items-center gap-2 ${type.brand} ${palette.text}`}
              >
                <BrandMark className="h-4 w-4" />
                Set-Aside
              </Link>
            </div>
          </div>
        </div>

        <article className={space.containerMd}>
          <header className="pt-12">
            <p className={`${type.caps} ${palette.ctaText}`}>Storage</p>
            <h1
              className={`mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-[-0.03em] ${palette.text} sm:text-5xl`}
            >
              Apps that dodge bank logins usually keep your numbers on one
              computer
            </h1>
            <p className={`mt-6 text-lg leading-relaxed ${palette.textSubtle}`}>
              Avoiding a bank connection is a reasonable line to draw. Doing it
              by storing everything in a single browser is the reason those apps
              cost you your records. Worth understanding which one you are
              choosing.
            </p>
          </header>

          <Para>
            There is a good argument for never handing a bank login to a money
            app. Providers of bank-linking services have been widely criticised,
            and the risk is real. A surprising number of tools took that concern
            seriously, and that is to their credit.
          </Para>

          <Para>
            The trouble is how they answered it. Rather than storing your
            records in a database that only you can log into, most of them kept
            them in your browser. That solves the bank problem and creates a
            different one, quietly, on your own machine.
          </Para>

          <H2>What browser storage actually means</H2>

          <Para>
            When a tool keeps your records in a browser, it writes them into
            storage attached to one browser profile on one machine. The app has
            no server copy. It cannot see them. It cannot migrate them for you.
          </Para>

          <Para>
            That means clearing your browsing data can take your records with
            it. Moving to a new laptop means starting again or hunting down a
            file. Getting the numbers onto your phone is often not possible at
            all.
          </Para>

          <Para>
            It also means backups are your job, and an ordinary backup habit
            usually covers documents and photos rather than a folder of finances
            nobody told you to copy.
          </Para>

          <H2>The trade-offs these vendors say out loud</H2>

          <Para>
            None of these vendors hide the single-device limit, which is
            refreshing. It is in their own words, which makes the comparison
            straightforward.
          </Para>

          <div className="mt-8 space-y-5">
            {COMPETITORS.map((c) => (
              <div key={c.name} className={`${recipe.surfaceCard} p-6`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <a
                    href={c.url}
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    className={`${type.sectionTitle} ${palette.ctaText} hover:underline`}
                  >
                    {c.name}
                  </a>
                  <span className={`${type.tiny} ${palette.textGhost}`}>vendor page, checked 1 Oct 2026</span>
                </div>
                <p className={`mt-3 border-l-2 ${palette.ctaBorder} pl-4 text-lg leading-relaxed ${palette.textMuted}`}>
                  {c.quote}
                </p>
                <p className={`mt-3 text-sm ${palette.textSubtle}`}>{c.point}</p>
              </div>
            ))}
          </div>

          <Para>
            Read those four quotes as a group and the pattern is obvious. Every
            one of them is a genuinely good product making the same structural
            choice, and every one of them sells multi-device as an upgrade.
            Nothing about that choice is a flaw in the software. It is a
            consequence of where they decided to keep your data.
          </Para>

          <H2>Five questions worth asking before you trust one</H2>

          <div className="mt-8 space-y-4">
            {CHECKS.map((c) => (
              <div key={c.q} className={`${recipe.surfaceCard} p-6`}>
                <h3 className={`${type.sectionTitle} ${palette.text}`}>{c.q}</h3>
                <p className={`mt-2 text-base leading-relaxed ${palette.textSubtle}`}>
                  {c.a}
                </p>
              </div>
            ))}
          </div>

          <H2>Where Set-Aside sits</H2>

          <Para>
            We also never connect to a bank. There is no bank login in the
            product and no code that could ask for one. The difference is where
            your records live.
          </Para>

          <Para>
            They go into a real database behind your own account. Sign in from
            any device you can receive an email on, and your numbers are there.
            Every record is tied to your account, so no other user can reach it
            by guessing an ID or sharing a link.
          </Para>

          <Para>
            To be fair about the other side: our records sit on someone
            else&apos;s server. We are not local-only and we do not pretend to
            be. The honest comparison is one database you sign into from
            anywhere, versus a file on one disk that you are responsible for
            copying.
          </Para>

          <Para>
            And you can take everything with you. Settings has a CSV export for
            any date range. Leaving should not be harder than arriving, which
            is a low bar that a fair number of tools in this category miss.
          </Para>

          <H2>A fair warning</H2>

          <Para>
            If you mostly work at one desk, never clear your browser data, and
            are content to check your numbers in one place, one of these tools
            is a reasonable choice and we are not going to pretend otherwise.
            Simplicity has real value, and storing less is genuinely safer from
            some angles.
          </Para>

          <Para>
            If you want your numbers on your phone, or you have been burned by
            losing a spreadsheet before, then the storage decision is the thing
            to look at. It matters more than any feature list.
          </Para>

          <div className={`mt-16 ${recipe.ctaPanel}`}>
            <h2 className={`mx-auto max-w-lg font-display text-2xl font-semibold tracking-[-0.02em] ${palette.text}`}>
              See what your months actually look like
            </h2>
            <p className={`mx-auto mt-4 max-w-md text-sm ${palette.textMuted}`}>
              A magic link gets you in. We never ask for a bank login, and you
              can export everything as CSV whenever you want.
            </p>
            <div className="mt-8 flex justify-center">
              <SignupCta variant="hero" />
            </div>
          </div>
        </article>

        <footer className={`mt-20 border-t py-12 ${palette.border}`}>
          <div className={space.containerMd}>
            <p className={`${type.brand} ${palette.text}`}>
              <Link href="/" className="flex items-center gap-2">
                <BrandMark className="h-4 w-4" />
                Set-Aside
              </Link>
            </p>
            <p className={`mt-3 max-w-xl text-sm leading-relaxed ${palette.textSubtle}`}>
              A money dashboard for freelancers. Records sit behind your own
              login, no bank connection is ever requested, and CSV export is
              always available.
            </p>
          </div>
        </footer>
      </AuthCtaProvider>
    </main>
  );
}