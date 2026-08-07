/**
 * Keeps customer facing catalog copy free of dash punctuation while preserving
 * the internal source text used for search, tracking, and notifications.
 */
export function displayText(value: string): string {
  return value
    .replace(/\s+[\-–—]\s+/g, ", ")
    .replace(/[\-–—]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
