"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { palette, recipe } from "@/lib/tokens";

export function DashboardAccountBar({ email }: { email: string }) {
  const { resolved, toggle } = useTheme();
  return (
    <header
      className={`flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-b bg-white px-6 py-3 dark:bg-gray-900 ${palette.border}`}
    >
      <span className={`hidden text-sm ${palette.textGhost} sm:inline`}>
        Signed in as{" "}
        <span className={`font-medium ${palette.text}`}>{email}</span>
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${palette.borderStrong} ${palette.textGhost} ${palette.surfaceHover}`}
      >
        {resolved === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <form action="/auth/signout" method="post">
        <button type="submit" className={recipe.btnGhost}>
          Sign out
        </button>
      </form>
    </header>
  );
}