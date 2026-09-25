import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Set-Aside",
  description:
    "Set-Aside is a money dashboard for the self-employed: categories, a tax set-aside, and a Net Position you can actually trust.",
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("set-aside-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`;

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