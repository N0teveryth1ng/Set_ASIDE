"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRESETS, type Preset, type PresetType } from "@/lib/presets";

export function PresetPicker() {
  const router = useRouter();
  const [picking, setPicking] = useState<PresetType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(preset: Preset) {
    setPicking(preset.preset);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: preset.preset }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setPicking(null);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setPicking(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.preset}
            type="button"
            onClick={() => choose(preset)}
            disabled={picking !== null}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{preset.preset}</h2>
              {picking === preset.preset && (
                <span className="text-sm text-gray-400">Setting up…</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {preset.categories.map((c) => (
                <span
                  key={c.name}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.type === "IN"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}