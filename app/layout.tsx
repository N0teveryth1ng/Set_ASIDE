import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AuthSignInWatcher from "@/components/auth-signin-watcher";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans text-gray-900 antialiased">
        <AuthSignInWatcher />
        {children}
      </body>
    </html>
  );
}