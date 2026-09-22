import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSignInWatcher from "@/components/auth-signin-watcher";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <AuthSignInWatcher />
        {children}
      </body>
    </html>
  );
}