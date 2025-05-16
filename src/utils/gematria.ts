/**
 * Hebrew Gematria Functions
 *
 * This module provides functions to convert between numbers and Hebrew characters
 * based on the traditional gematria system.
 */

// Hebrew letter to number mapping
const hebrewGematriaMap: Record<string, number> = {
  א: 1, // Alef
  ב: 2, // Bet
  ג: 3, // Gimel
  ד: 4, // Dalet
  ה: 5, // He
  ו: 6, // Vav
  ז: 7, // Zayin
  ח: 8, // Het
  ט: 9, // Tet
  י: 10, // Yod
  כ: 20, // Kaf
  ל: 30, // Lamed
  מ: 40, // Mem
  נ: 50, // Nun
  ס: 60, // Samekh
  ע: 70, // Ayin
  פ: 80, // Pe
  צ: 90, // Tsadi
  ק: 100, // Qof
  ר: 200, // Resh
  ש: 300, // Shin
  ת: 400, // Tav
  ך: 20, // Final Kaf
  ם: 40, // Final Mem
  ן: 50, // Final Nun
  ף: 80, // Final Pe
  ץ: 90, // Final Tsadi
};

// Build reverse mapping (number to Hebrew letter)
const reverseGematriaMap: Record<number, string> = {};
for (const [letter, value] of Object.entries(hebrewGematriaMap)) {
  // Avoid duplicating final forms in the reverse mapping
  if (!["ך", "ם", "ן", "ף", "ץ"].includes(letter)) {
    reverseGematriaMap[value] = letter;
  }
}

/**
 * Converts a number to its Hebrew character representation according to gematria
 *
 * @param num - The number to convert (1-999)
 * @returns The Hebrew character representation
 */
export function numberToHebrew(num: number): string {
  if (num <= 0 || num > 999) {
    throw new Error("Number must be between 1 and 999");
  }

  let result = "";

  // Handle hundreds (100-900)
  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    if (hundreds <= 4) {
      // 100-400 can be represented directly
      result += reverseGematriaMap[hundreds * 100];
    } else {
      // 500-900 are represented by combinations
      // For example, 500 = 400 + 100, 600 = 400 + 200, etc.
      result += reverseGematriaMap[400];
      result += reverseGematriaMap[(hundreds - 4) * 100];
    }
  }

  // Handle tens (10-90)
  const tens = Math.floor((num % 100) / 10);
  if (tens > 0) {
    result += reverseGematriaMap[tens * 10];
  }

  // Handle ones (1-9)
  const ones = num % 10;
  if (ones > 0) {
    result += reverseGematriaMap[ones];
  }

  // For numbers 15 and 16, replace יה and יו with טו and טז respectively
  // to avoid writing part of the divine name
  if (num === 15) {
    return "טו";
  } else if (num === 16) {
    return "טז";
  }

  return result;
}

/**
 * Converts Hebrew characters to their numerical value according to gematria
 *
 * @param hebrewStr - The Hebrew string to convert
 * @returns The numerical value
 */
export function hebrewToNumber(hebrewStr: string): number {
  if (!hebrewStr || hebrewStr.length === 0) {
    throw new Error("Hebrew string cannot be empty");
  }

  // Special cases for 15 and 16
  if (hebrewStr === "טו") {
    return 15;
  } else if (hebrewStr === "טז") {
    return 16;
  }

  let sum = 0;
  for (const char of hebrewStr) {
    if (hebrewGematriaMap[char] === undefined) {
      throw new Error(`Invalid Hebrew character: ${char}`);
    }
    sum += hebrewGematriaMap[char];
  }

  return sum;
}
