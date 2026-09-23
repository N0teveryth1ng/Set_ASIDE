/**
 * Guesses the plural form of a singular English word using simple heuristics.
 * @param word - The singular word to pluralize.
 * @returns The guessed plural form of the word.
 */
function autoPlural(word: string): string {
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/s$|x$|z$|ch$|sh$/.test(word)) return `${word}es`;
  return `${word}s`;
}

/**
 * Formats a count together with the correctly pluralized form of a word.
 * @param count - The number of items; determines singular vs. plural form.
 * @param singular - The singular form of the word.
 * @param plural - Optional explicit plural form; if omitted, it is guessed via `autoPlural`.
 * @returns A string combining the count and the appropriate word form, e.g. "1 item" or "2 items".
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const form = count === 1 ? singular : (plural ?? autoPlural(singular));
  return `${count} ${form}`;
}