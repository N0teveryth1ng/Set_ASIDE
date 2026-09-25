"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { palette, recipe } from "@/lib/tokens";

const STEPS = [
  {
    title: "Your numbers at a glance",
    body: "Overview shows your net position, money in and out, and tax set-aside. Green is money gained, red is lost, gray is neutral.",
  },
  {
    title: "Entries drive everything",
    body: "Add every income or expense as an entry under a category. Direction comes from the category — you never enter a sign.",
  },
  {
    title: "Tax set-aside",
    body: "A percentage of income is set aside automatically so filing season never surprises you. Adjust the rate in Settings.",
  },
  {
    title: "Categories are yours",
    body: "Rename, add, or hide categories any time in Settings. The preset is just a starting point.",
  },
];

export function TutorialOverlay() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function finish() {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding/tutorial", { method: "POST" });
    } finally {
      router.refresh();
    }
  }

  const last = step === STEPS.length - 1;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${palette.inkOverlay}`}>
      <div className={`w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900`}>
        <div className="mb-4 flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? palette.ink : palette.inkSoftHover
              }`}
            />
          ))}
        </div>
        <h2 className={`text-lg font-semibold ${palette.text}`}>{STEPS[step].title}</h2>
        <p className={`mt-2 text-sm leading-relaxed ${palette.textSubtle}`}>{STEPS[step].body}</p>
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            disabled={submitting}
            className={`text-sm font-medium ${palette.textGhost} transition-colors hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-60`}
          >
            Skip tutorial
          </button>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep((s) => s + 1))}
            disabled={submitting}
            className={recipe.btnPrimary}
          >
            {last ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}