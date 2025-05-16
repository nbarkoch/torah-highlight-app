import type { AliyaData } from "../core/models/aliyaResp";
import type {
  Aliyah,
  ProcessedAliyah,
  ProcessedWord,
} from "../core/models/Parasha";

const hebrewSpellAlya = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שביעי",
  "מפטיר",
];

/**
 * Parse the provided JSON string into a ProcessedAliyah
 * This function is the main entry point for processing raw JSON data
 */
export const parseAliyahJson = (
  rawData: AliyaData,
  audioUrl: string
): ProcessedAliyah => {
  try {
    const aliyaIndex = 0;
    // Create a default Aliyah structure with the raw data
    const aliyah: Aliyah = {
      id: `${aliyaIndex + 1}`,
      name: hebrewSpellAlya[aliyaIndex],
      verses:
        rawData.t_words.map((tword, index) => ({
          text: rawData.verses[index],
          words: tword.text,
          start: tword.start,
          end: tword.end,
        })) || [],
      audioUrl,
      perek_starts: rawData.perek_starts || [],
      offset: rawData.start_offset,
    };

    // Process the aliyah data
    return processAliyahForRendering(aliyah);
  } catch (error) {
    console.error("Failed to parse aliyah JSON:", error);
    throw new Error("Invalid aliyah data format");
  }
};

/**
 * Processes an Aliyah object into the application's rendering format
 * This converts the raw data structure into our internal format
 */
export const processAliyahForRendering = (aliyah: Aliyah): ProcessedAliyah => {
  // First, flatten the t_words array structure to get all words with timing
  const allTimedWords = aliyah.verses.flatMap((verse) => verse.words);

  // Process each verse
  const processedVerses = aliyah.verses.map((verseText, index) => {
    // Find which perek this verse belongs to
    const perek = findPerekForVerse(index, aliyah.perek_starts);

    // Split the verse text into words and create word objects with timestamps
    const words = processVerseWords(verseText.text, allTimedWords, index);

    return {
      number: index + 1,
      text: verseText,
      words,
      perek,
    };
  });

  //   {
  //     number: number;
  //     text: VerseData;
  //     words: ProcessedWord[];
  //     perek: string | undefined;
  // }

  //aliyah.verses
  // {
  //   text: string;
  //   words: Word[];
  //   start: number;
  //   end: number;
  // }

  return {
    id: aliyah.id,
    name: aliyah.name,
    verses: processedVerses,
    audioUrl: aliyah.audioUrl,
    offset: aliyah.offset,
  };
};

/**
 * Determines which perek a verse belongs to based on the perek_starts array
 */
const findPerekForVerse = (
  verseIndex: number,
  perekStarts: { perek: string; start_index: number }[]
): string | undefined => {
  if (!perekStarts || perekStarts.length === 0) return undefined;

  // Sort the perek starts by index (just to be safe)
  const sortedStarts = [...perekStarts].sort(
    (a, b) => a.start_index - b.start_index
  );

  // Find the last perek start that is <= the verse index
  for (let i = sortedStarts.length - 1; i >= 0; i--) {
    if (verseIndex >= sortedStarts[i].start_index) {
      return sortedStarts[i].perek;
    }
  }

  // If we can't find a matching perek, return the first one
  return sortedStarts[0].perek;
};

/**
 * Process words in a verse, matching them with timestamped words
 */
const processVerseWords = (
  verseText: string,
  timestampedWords: { word: string; start: number; end: number }[],
  verseIndex: number
): ProcessedWord[] => {
  // Split the verse into words, preserving punctuation for proper matching
  // This regex works better for Hebrew text
  const wordsWithPunctuation = verseText.split(/\s+/);

  // Process each word
  return wordsWithPunctuation.map((wordWithPunct, wordIndex) => {
    // Remove punctuation for matching purposes (keep only Hebrew characters)
    const wordForMatching = wordWithPunct.replace(
      // eslint-disable-next-line no-misleading-character-class
      /[^\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\u0591-\u05C7]/g,
      ""
    );

    // Find the best matching timestamped word
    const match = findBestMatchingWord(wordForMatching, timestampedWords);

    return {
      id: `${verseIndex}-${wordIndex}`,
      text: wordWithPunct, // Keep the original word with punctuation for display
      startTime: match ? match.start : 0,
      endTime: match ? match.end : 0,
    };
  });
};

/**
 * Find the best matching timestamped word using a similarity algorithm
 */
const findBestMatchingWord = (
  word: string,
  timestampedWords: { word: string; start: number; end: number }[]
): { word: string; start: number; end: number } | null => {
  if (!timestampedWords || timestampedWords.length === 0) {
    return null;
  }

  // Simple exact match
  const exactMatch = timestampedWords.find((tw) => tw.word === word);
  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match, find the most similar word
  // For now, just check if one contains the other
  let bestMatch = null;
  let bestScore = -1;

  for (const tw of timestampedWords) {
    let score = 0;

    if (tw.word.includes(word)) {
      score = word.length / tw.word.length;
    } else if (word.includes(tw.word)) {
      score = tw.word.length / word.length;
    } else {
      // Calculate character overlap
      const charSet = new Set([...word]);
      let commonChars = 0;
      for (const char of tw.word) {
        if (charSet.has(char)) {
          commonChars++;
        }
      }
      score = commonChars / Math.max(word.length, tw.word.length);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = tw;
    }
  }

  // Only return matches with a minimum similarity
  return bestScore > 0.5 ? bestMatch : null;
};
