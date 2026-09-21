"use client";

import { recipe } from "@/lib/tokens";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={recipe.btnPrimary}
    >
      {label}
    </button>
  );
}