"use client";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
    >
      {label}
    </button>
  );
}