import type { AliyaAudioData, AliyaData } from "../core/models/aliyaResp";
import type { Aliyah, ProcessedAliyah } from "../core/models/Parasha";

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
  rawData: AliyaData & AliyaAudioData,
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
          text: rawData.verses[index].text,
          words: tword.text,
          start: tword.start,
          end: tword.end,
        })) || [],
      audioUrl,
      perek_starts: rawData.perek_starts || [],
      offset: rawData.start_offset,
      stops: rawData.stops,
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
  // const allTimedWords = aliyah.verses.flatMap((verse) => verse.words);

  // Process each verse
  const processedVerses = aliyah.verses.map((verseText, index) => {
    // Find which perek this verse belongs to
    const perek =
      aliyah.perek_starts.find(
        (pStart, pIndex) =>
          pStart.start_index <= index &&
          index < (aliyah.perek_starts[pIndex + 1]?.start_index ?? Infinity)
      )?.perek ?? "";

    // Split the verse text into words and create word objects with timestamps
    const words = verseText.words.map((word, j) => {
      return {
        id: `${index}-${j}`,
        text: word.word,
        startTime: word.start,
        endTime: word.end,
      };
    });

    return {
      number: index + 1,
      text: verseText.text,
      words,
      perek,
      stop: aliyah.stops.find((stop) => stop.verse_index === index)?.type,
    };
  });

  return {
    id: aliyah.id,
    name: aliyah.name,
    verses: processedVerses,
    audioUrl: aliyah.audioUrl,
    offset: aliyah.offset,
    stops: aliyah.stops,
  };
};
