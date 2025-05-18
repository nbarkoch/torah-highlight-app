/**
 * Utility functions for handling Hebrew text with nikkud and taamim
 */

/**
 * Removes all Hebrew nikkud and taamim (vowel points and cantillation marks)
 * while preserving letters, maqaf (־), ASCII hyphen, and punctuation.
 *
 * @param text - Hebrew text with nikkud/taamim
 * @returns Cleaned text without nikkud/taamim
 */
export const removeNikkudAndTaamim = (text: string): string => {
  if (!text) return text;

  // Hebrew nikkud and taamim range: \u0591 - \u05BD, \u05BF - \u05C7
  return text.replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "");
};

/**
 * Determines if a character is a Hebrew nikkud or taamim mark
 *
 * @param char - Single character to test
 * @returns True if the character is a nikkud or taamim mark
 */
export const isNikkudOrTaamim = (char: string): boolean => {
  if (char.length !== 1) return false;

  // Check if the character is in the Unicode range for Hebrew nikkud and taamim
  const code = char.charCodeAt(0);
  return code >= 0x0591 && code <= 0x05c7;
};

/**
 * Gets only the base Hebrew characters from a string
 *
 * @param text - Hebrew text with potential nikkud/taamim
 * @returns Array of base Hebrew characters (without nikkud/taamim)
 */
export const getBaseHebrewChars = (text: string): string[] => {
  return Array.from(text).filter((char) => !isNikkudOrTaamim(char));
};
