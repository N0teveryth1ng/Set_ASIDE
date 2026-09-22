"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { palette, recipe, type } from "@/lib/tokens";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/import", label: "Import" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardHeader({ email }: { email: string }) {
  const path = usePathname();

  return (
    <header className={`flex flex-wrap items-center justify-between gap-y-3 border-b bg-white px-6 py-3 ${palette.border}`}>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <h1 className={`${type.brand} ${palette.text}`}>Set-Aside</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const active =
              path === link.href ||
              (link.href !== "/dashboard" && path.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? `${palette.inkSoft} ${palette.text}`
                    : `${palette.textGhost} ${palette.surfaceHover} hover:text-gray-900`
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className={`hidden text-sm ${palette.textGhost} sm:inline`}>
          Signed in as <span className={`font-medium ${palette.text}`}>{email}</span>
        </span>
        <form action="/auth/signout" method="post">
          <button type="submit" className={recipe.btnGhost}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}