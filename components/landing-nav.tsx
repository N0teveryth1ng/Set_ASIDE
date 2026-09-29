"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { NavAuthCta, NavAuthCtaMobile } from "@/components/auth-cta";
import { recipe, palette, type } from "@/lib/tokens";

const SECTIONS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-gray-50/90 backdrop-blur dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className={`flex items-center gap-2 ${type.brand} ${palette.text}`}>
          <BrandMark className="h-4 w-4" />
          Set-Aside
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing sections">
          {SECTIONS.map((section) => (
            <a key={section.href} href={section.href} className={recipe.navLink}>
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <NavAuthCta />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 md:hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-6 pb-6 pt-3 md:hidden dark:border-gray-800 dark:bg-gray-900">
          <nav className="flex flex-col" aria-label="Landing sections (mobile)">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={close}
                className={recipe.navLink}
              >
                {section.label}
              </a>
            ))}
          </nav>
          <NavAuthCtaMobile onNavigate={close} />
        </div>
      )}
    </header>
  );
}