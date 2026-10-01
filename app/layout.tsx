import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import AuthSignInWatcher from "@/components/auth-signin-watcher";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://set-aside-nine.vercel.app";

const SOFTWARE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Set-Aside",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "A money dashboard for freelancers with uneven income. Shows what you can actually spend and moves a tax set-aside aside on every positive period.",
  featureList: [
    "Net Position on one screen",
    "Tax set-aside at a percentage you choose",
    "One-time spreadsheet import",
    "CSV export of every entry",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Set-Aside: what is yours after tax, for freelancers",
  description:
    "A money dashboard for freelancers with uneven income. See what you can actually spend and move the tax share aside the day you get paid. Never connects to your bank.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Set-Aside",
    title: "Set-Aside: what is yours after tax, for freelancers",
    description:
      "See what you can actually spend, and move the tax share aside the day you get paid. No bank login, ever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Set-Aside: what is yours after tax, for freelancers",
    description:
      "See what you can actually spend, and move the tax share aside the day you get paid. No bank login, ever.",
  },
  robots: { index: true, follow: true },
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("set-aside-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`;

// Anonymous visitors never have an auth cookie, so nothing is hidden from them
// and the CTA slot stays visible at first paint. Only when a session cookie
// exists do we hide it and keep it hidden unless we have nothing better: if the
// app bundle never arrives or React never takes over, this reveals the
// signed-out buttons after 1500ms regardless of what else happened.
const AUTH_SCRIPT = `try{var m=document.cookie.match(/(?:^|;\\s*)sb-[^=]*-auth-token[^=]*=/);if(m){var d=document.documentElement;d.dataset.authPending="1";setTimeout(function(){if(d.dataset.authPending)delete d.dataset.authPending},1500)}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: AUTH_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSONLD) }}
        />
        {/* Umami analytics: loaded once, in the root layout. Umami's tracker
            patches the History API (pushState/replaceState/popstate) and sends
            a pageview on every client-side route change, so in-app navigation
            (landing → /login → /dashboard) is tracked without manual calls. */}
        <Script
          strategy="afterInteractive"
          src="https://cloud.umami.is/script.js"
          data-website-id="a0473930-082e-4755-8f84-3315122027e7"
        />
      </head>
      <body className="font-sans text-gray-900 antialiased dark:text-gray-100">
        <ThemeProvider>
          <AuthSignInWatcher />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}