function autoPlural(word: string): string {
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/s$|x$|z$|ch$|sh$/.test(word)) return `${word}es`;
  return `${word}s`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const form = count === 1 ? singular : (plural ?? autoPlural(singular));
  return `${count} ${form}`;
}