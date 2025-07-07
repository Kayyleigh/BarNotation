/**
 * Converts a single word to title case.
 * Capitalizes the first character and lowercases the rest.
 *
 * @param word - The input string to convert.
 * @returns The title-cased version of the input string.
 *
 * @example
 * titleCaseWord("hello"); // "Hello"
 * titleCaseWord("WORLD"); // "World"
 * titleCaseWord("");      // ""
 */
export function titleCaseWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
