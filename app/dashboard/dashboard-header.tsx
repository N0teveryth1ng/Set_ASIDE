"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
];

export function DashboardHeader({ email }: { email: string }) {
  const path = usePathname();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Set-Aside</h1>
        </div>
        <nav className="flex items-center gap-1">
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
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-500 sm:inline">
          Signed in as <span className="font-medium text-gray-900">{email}</span>
        </span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}