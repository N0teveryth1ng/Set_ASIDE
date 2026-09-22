"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRESETS, type Preset, type PresetType } from "@/lib/presets";
import { palette, radius, recipe, type } from "@/lib/tokens";

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
            className={`${radius.card} ${palette.border} ${palette.surface} p-6 text-left transition-colors ${palette.surfaceHover} hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <h2 className={`${type.sectionTitle} ${palette.text}`}>{preset.preset}</h2>
              {picking === preset.preset && (
                <span className={`text-sm ${palette.textGhost}`}>Setting up…</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {preset.categories.map((c) => (
                <span
                  key={c.name}
                  className={`${recipe.chip} ${
                    c.type === "IN"
                      ? palette.gainChip
                      : `${palette.inkSoft} ${palette.textSubtle}`
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
        <p className={`mt-4 ${recipe.errorBoxLg}`}>{error}</p>
      )}
    </div>
  );
}