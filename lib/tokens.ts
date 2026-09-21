// Set-Aside — the single design-token source (Phase 8).
// Every color, spacing step, radius, and type size used anywhere in the app
// resolves from this file. Editing the visual system means editing THIS file —
// components never introduce ad hoc color/type/spacing literals of their own.
//
// Conventions enforced here:
//   - One neutral family (gray) — no slate/zinc/stone/neutral mixes.
//   - Semantics: `gain` = emerald (money in / positive net), `loss` = red
//     (money out / negative net), `warn` = amber (review / not final),
//     `canvas` = gray-50 page background, `surface` = white cards.
//   - "Ink" is the near-black used for primary surfaces and buttons (gray-900).

export const palette = {
  canvas: "bg-gray-50",
  surface: "bg-white",

  border: "border-gray-200",
  borderStrong: "border-gray-300",
  borderFocus: "border-gray-400",
  divide: "divide-gray-100",
  divideStrong: "divide-gray-200",

  ink: "bg-gray-900",
  inkHover: "bg-gray-700",
  inkSoft: "bg-gray-100",
  inkSoftHover: "bg-gray-200",
  inkFaint: "bg-gray-400",
  inkOverlay: "bg-gray-900/40",
  surfaceHover: "hover:bg-gray-50",

  text: "text-gray-900",
  textMuted: "text-gray-700",
  textSubtle: "text-gray-600",
  textFaint: "text-gray-500",
  textGhost: "text-gray-400",
  textInverse: "text-white",

  gainText: "text-emerald-600",
  gainStrong: "text-emerald-700",
  gainChip: "bg-emerald-100 text-emerald-800",
  gainBar: "bg-emerald-500",
  gainStroke: "text-emerald-500",

  lossText: "text-red-600",
  lossStrong: "text-red-700",
  lossChip: "bg-red-100 text-red-800",
  lossBar: "bg-red-500",
  lossBorder: "border-red-200",

  warnChip: "bg-amber-100 text-amber-800",
  warnSoftBg: "bg-amber-50/40",

  dangerSolid: "text-red-600 hover:bg-red-50",
} as const;

export const radius = {
  card: "rounded-2xl",
  box: "rounded-xl",
  control: "rounded-md",
  pill: "rounded-full",
} as const;

export const type = {
  hero: "text-4xl font-bold",
  cardValue: "text-2xl font-semibold",
  cardLabel: "text-sm font-medium",
  pageTitle: "text-lg font-semibold",
  sectionTitle: "text-base font-semibold",
  heading: "text-xl font-semibold",
  text: "text-sm",
  tiny: "text-xs",
  chip: "text-xs font-medium",
  tbodyCell: "text-sm",
  caps: "text-xs uppercase tracking-wide",
} as const;

export const space = {
  page: "px-6 py-10",
  pageLg: "px-6 py-12",
  containerMd: "mx-auto max-w-3xl px-6",
  containerLg: "mx-auto max-w-5xl px-6",
  stack: "space-y-6",
  stackXs: "space-y-3",
  stackXxs: "space-y-2",
  card: "p-5",
  cardLg: "p-6",
} as const;

// Composed recipes — the class strings shared across components today,
// now sourced from one place so a later change lands everywhere at once.
export const recipe = {
  page: `min-h-screen ${palette.canvas}`,
  surface: `${radius.card} ${palette.border} ${palette.surface}`,
  surfaceDashed: `${radius.card} border border-dashed ${palette.borderStrong} ${palette.surface}`,
  surfaceBox: `${radius.box} ${palette.border} ${palette.surface}`,

  input: `w-full rounded-md border ${palette.borderStrong} px-2.5 py-1.5 text-sm ${palette.text} focus:border-gray-400 focus:outline-none`,
  inputControl: `rounded-md border ${palette.borderStrong} px-3 py-2 text-sm ${palette.text}`,
  label: "block text-sm font-medium text-gray-700",
  labelThin: "text-xs font-medium text-gray-500",

  btnPrimary: `rounded-md ${palette.ink} px-4 py-1.5 text-sm font-medium ${palette.textInverse} transition-colors hover:bg-gray-700 disabled:opacity-60`,
  btnPrimaryLg: `rounded-md ${palette.ink} px-4 py-2 text-sm font-medium ${palette.textInverse} transition-colors hover:bg-gray-700 disabled:opacity-50`,
  btnGhost: `rounded-md border ${palette.borderStrong} px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50`,
  btnGhostLg: `rounded-md border ${palette.borderStrong} ${palette.surface} px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50`,
  btnDanger: `rounded-md border ${palette.borderStrong} px-3 py-1.5 text-sm transition-colors ${palette.dangerSolid}`,

  errorBox: `${radius.box} border ${palette.lossBorder} ${palette.lossText} bg-red-50 px-4 py-3 text-sm`,
  errorBoxLg: `rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700`,
  successNote: `rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700`,

  pillToggle: (selected: boolean) =>
    `rounded-full px-3 py-1 text-sm font-medium transition ${
      selected
        ? `${palette.ink} text-white`
        : `bg-gray-100 text-gray-600 hover:bg-gray-200`
    } disabled:opacity-50`,
  chip: `rounded-full px-2 py-0.5 text-xs font-medium`,
} as const;