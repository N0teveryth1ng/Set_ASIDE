"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { palette, recipe, type } from "@/lib/tokens";

const SECTIONS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-gray-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className={`${type.brand} ${palette.text}`}>
          Set-Aside
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing sections">
          {SECTIONS.map((section) => (
            <a key={section.href} href={section.href} className={recipe.navLink}>
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={`${recipe.btnGhost} px-4 py-2`}>
            Log in
          </Link>
          <Link href="/login" className={`${recipe.btnPrimary} px-4 py-2`}>
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 md:hidden"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-6 pb-6 pt-3 md:hidden">
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
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={close} className={`${recipe.btnGhost} px-4 py-2 text-center`}>
              Log in
            </Link>
            <Link href="/login" onClick={close} className={`${recipe.btnPrimary} px-4 py-2 text-center`}>
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}