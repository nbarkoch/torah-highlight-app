import type { ProcessedWord } from "../models/Parasha";

/**
 * Find the current word based on the current audio time
 */
export const findCurrentWord = (
  words: ProcessedWord[],
  currentTime: number
): ProcessedWord | null => {
  // Find the word where currentTime falls between startTime and endTime
  return (
    words.find(
      (word) =>
        currentTime + 0.2 >= word.startTime && currentTime < word.endTime
    ) || null
  );
};

/**
 * Get all words in a flattened array from verses
 */
export const getAllWords = (
  verses: { words: ProcessedWord[] }[]
): ProcessedWord[] => {
  return verses.flatMap((verse) => verse.words);
};
