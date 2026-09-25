"use client";

import { palette, recipe } from "@/lib/tokens";

export function DashboardAccountBar({ email }: { email: string }) {
  return (
    <header
      className={`flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-b bg-white px-6 py-3 ${palette.border}`}
    >
      <span className={`hidden text-sm ${palette.textGhost} sm:inline`}>
        Signed in as{" "}
        <span className={`font-medium ${palette.text}`}>{email}</span>
      </span>
      <form action="/auth/signout" method="post">
        <button type="submit" className={recipe.btnGhost}>
          Sign out
        </button>
      </form>
    </header>
  );
}