// Set-Aside — the single design-token source (Phase 8).
// Every color, spacing step, radius, and type size used anywhere in the app
// resolves from this file. Editing the visual system means editing THIS file —
// components never introduce ad hoc color/type/spacing literals of their own.
//
// Conventions enforced here:
//   - One neutral family (gray) — no slate/zinc/stone/neutral mixes.
//   - Semantics: `gain` = emerald (money in / positive net), `loss` = red
//     (money out / negative net), `warn` = amber (review / not final),
//     `canvas` = pale page background, `surface` = white cards.
//   - `cta` = the single accent (indigo #4F46E5 — the brand color). Used
//     sparingly: primary CTAs, active/focus states, and nothing else decorative.
//   - "Ink" is the near-black used for hero/primary pill buttons and secondary
//     surfaces. The only hex values in the app live in this file.
//   - Every value ships a `dark:` pair so the theme toggle keeps working.

export const palette = {
  canvas: "bg-[#F9FAFB] dark:bg-gray-950",
  surface: "bg-white dark:bg-gray-900",

  border: "border-gray-200 dark:border-gray-800",
  borderStrong: "border-gray-300 dark:border-gray-700",
  borderFocus: "border-gray-400 dark:border-gray-600",
  divide: "divide-gray-100 dark:divide-gray-800",
  divideStrong: "divide-gray-200 dark:divide-gray-800",

  ink: "bg-gray-900 dark:bg-gray-800",
  inkHover: "hover:bg-gray-700 dark:hover:bg-gray-600",
  inkSoft: "bg-gray-100 dark:bg-gray-800",
  inkSoftHover: "bg-gray-200 dark:hover:bg-gray-700",
  inkFaint: "bg-gray-400 dark:bg-gray-500",
  inkOverlay: "bg-gray-900/40 dark:bg-black/40",
  surfaceHover: "hover:bg-gray-50 dark:hover:bg-gray-800/70",

  text: "text-gray-900 dark:text-gray-100",
  textMuted: "text-gray-700 dark:text-gray-300",
  textSubtle: "text-gray-600 dark:text-gray-400",
  textFaint: "text-gray-500 dark:text-gray-400",
  textGhost: "text-gray-400 dark:text-gray-400",
  textInverse: "text-white",

  gainText: "text-emerald-600 dark:text-emerald-400",
  gainStrong: "text-emerald-700 dark:text-emerald-300",
  gainChip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  gainBar: "bg-emerald-500 dark:bg-emerald-400",
  gainStroke: "text-emerald-500 dark:text-emerald-400",

  lossText: "text-red-600 dark:text-red-400",
  lossStrong: "text-red-700 dark:text-red-300",
  lossChip: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  lossBar: "bg-red-500 dark:bg-red-400",
  lossBorder: "border-red-200 dark:border-red-500/30",

  warnChip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  warnSoftBg: "bg-amber-50/40 dark:bg-amber-500/10",

  dangerSolid: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",

  // Single accent — indigo (brand color, restored). All hex values live here.
  cta: "bg-[#4F46E5]",
  ctaHover: "hover:bg-[#4338CA]",
  ctaSoft: "bg-[#EEF2FF] dark:bg-[#EEF2FF]/10",
  ctaSoftHover: "hover:bg-[#EEF2FF] dark:hover:bg-[#EEF2FF]/10",
  ctaText: "text-[#4F46E5] dark:text-[#A5B4FC]",
  ctaTextHover: "hover:text-[#4338CA] dark:hover:text-[#818CF8]",
  ctaBorder: "border-[#4F46E5]",
  ctaRing: "focus:ring-[#4F46E5]/30",
  ctaBar: "bg-[#4F46E5]/80",

  

  // Landing-specific surfaces — light-first, neutral paper + white cards.
  heroTint: "bg-[#F6F7FB] dark:bg-gray-900/60",
  tileAccent: "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#EEF2FF]/10 dark:text-[#A5B4FC]",
  ringInset: "ring-1 ring-inset ring-gray-900/5 dark:ring-white/10",
  shadowPanel:
    "shadow-[0_1px_2px_rgba(16,24,40,0.05),0_28px_56px_-18px_rgba(79,70,229,0.16)] dark:shadow-none",
} as const;

export const radius = {
  card: "rounded-2xl",
  box: "rounded-xl",
  control: "rounded-md",
  pill: "rounded-full",
  panel: "rounded-3xl",
  mock: "rounded-[2.5rem]",
} as const;

export const type = {
  displayHero: "font-display text-5xl font-semibold tracking-[-0.03em] sm:text-6xl",
  displayJumbo: "font-display text-[2.6rem] font-semibold leading-tight tracking-[-0.03em] sm:text-7xl",
  heroNumber: "font-display text-5xl font-semibold tracking-[-0.02em] tabular-nums sm:text-6xl",
  brand: "font-display text-lg font-semibold tracking-tight",
  pageTitle: "font-display text-2xl font-semibold tracking-tight",
  cardValue: "text-2xl font-semibold tabular-nums",
  cardLabel: "text-sm font-medium",
  sectionTitle: "text-base font-semibold",
  section2: "font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl",
  statNumber: "font-display text-4xl font-semibold tracking-[-0.02em] tabular-nums",
  heading: "font-display text-xl font-semibold tracking-tight",
  text: "text-sm",
  tiny: "text-xs",
  chip: "text-xs font-medium",
  tbodyCell: "text-sm",
  caps: "text-xs uppercase tracking-[0.08em]",
} as const;

export const space = {
  page: "px-6 py-12",
  pageLg: "px-6 py-14",
  containerMd: "mx-auto max-w-3xl px-6",
  containerLg: "mx-auto max-w-5xl px-6",
  stack: "space-y-6",
  stackLg: "space-y-8",
  stackXs: "space-y-3",
  stackXxs: "space-y-2",
  card: "p-6",
  cardLg: "p-8",
} as const;

// Composed recipes — the class strings shared across components today,
// now sourced from one place so a later change lands everywhere at once.
export const recipe = {
  page: `min-h-screen ${palette.canvas}`,
  surface: `${radius.card} ${palette.border} ${palette.surface}`,
  surfaceDashed: `${radius.card} border border-dashed ${palette.borderStrong} ${palette.surface}`,
  surfaceBox: `${radius.box} ${palette.border} ${palette.surface}`,

  input: `w-full ${radius.pill} border ${palette.borderStrong} px-4 py-2 text-sm ${palette.text} focus:border-gray-400 focus:outline-none dark:bg-gray-900 dark:focus:border-gray-500 dark:placeholder:text-gray-500`,
  inputControl: `${radius.pill} border ${palette.borderStrong} px-4 py-2 text-sm ${palette.text} dark:bg-gray-900`,
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
  labelThin: "text-xs font-medium text-gray-500 dark:text-gray-400",

  btnPrimary: `${radius.pill} ${palette.cta} px-5 py-2 text-sm font-medium ${palette.textInverse} transition-colors ${palette.ctaHover} focus:outline-none ${palette.ctaRing} disabled:opacity-60`,
  btnPrimaryLg: `${radius.pill} ${palette.cta} px-5 py-2.5 text-sm font-medium ${palette.textInverse} transition-colors ${palette.ctaHover} focus:outline-none ${palette.ctaRing} disabled:opacity-50`,
  btnGhost: `${radius.pill} border ${palette.borderStrong} px-4 py-1.5 text-sm text-gray-600 transition-colors ${palette.surfaceHover} dark:text-gray-300`,
  btnGhostLg: `${radius.pill} border ${palette.borderStrong} ${palette.surface} px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors ${palette.surfaceHover} dark:text-gray-200`,
  btnDanger: `${radius.pill} border ${palette.borderStrong} px-4 py-2 text-sm transition-colors ${palette.dangerSolid}`,

  errorBox: `${radius.box} border ${palette.lossBorder} ${palette.lossText} bg-red-50 px-4 py-3 text-sm dark:bg-red-500/10`,
  errorBoxLg: `rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300`,
  successNote: `rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300`,

  pillToggle: (selected: boolean) =>
    `rounded-full px-3 py-1 text-sm font-medium transition ${
      selected
        ? `${palette.ink} text-white`
        : `bg-gray-100 text-gray-600 ${palette.surfaceHover} dark:bg-gray-800 dark:text-gray-400`
    } disabled:opacity-50`,
  chip: `rounded-full px-2 py-0.5 text-xs font-medium`,

  navLink: "rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
  faqRow: `${radius.card} border ${palette.borderStrong} ${palette.surface} px-5 py-4`,
  ctaPanel: `${radius.card} ${palette.ctaSoft} px-8 py-12 text-center`,
  ctaPanelBig: `${radius.panel} ${palette.ctaSoft} px-8 py-16 text-center sm:px-16`,

  // Landing (FlexFolio) recipes — landing only; nothing shared with the app.
  eyebrow: `inline-flex items-center gap-2 ${radius.pill} ${palette.ctaSoft} px-3 py-1 ${type.caps} ${palette.ctaText}`,
  btnHero: `inline-flex items-center justify-center ${radius.pill} ${palette.ink} px-7 py-3.5 text-base font-semibold ${palette.textInverse} transition-colors ${palette.inkHover} focus:outline-none ${palette.ctaRing}`,
  btnHeroGhost: `inline-flex items-center justify-center ${radius.pill} border ${palette.borderStrong} ${palette.surface} px-7 py-3.5 text-base font-semibold ${palette.text} transition-colors ${palette.surfaceHover}`,
  iconTile: `flex h-11 w-11 items-center justify-center ${radius.pill} ${palette.tileAccent}`,
  stepChip: `flex h-10 w-10 items-center justify-center ${radius.pill} ${palette.ctaSoft} font-display text-base font-semibold ${palette.ctaText}`,
  surfaceCard: `${radius.panel} border ${palette.border} ${palette.surface} shadow-sm`,
  mockPanel: `${radius.mock} ${palette.surface} ${palette.ringInset} ${palette.shadowPanel} p-6 sm:p-10`,
} as const;