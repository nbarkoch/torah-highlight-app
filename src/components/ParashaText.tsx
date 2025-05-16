import { useMemo } from "react";
import type { ProcessedVerse, ProcessedWord } from "../core/models/Parasha";
import HighlightableWord from "./HighlightableWord";

interface ParashaTextProps {
  verses: ProcessedVerse[];
  highlightedWordId: string | null;
  offset?: number;
  handleWordClick: (word?: ProcessedWord) => void;
}

const convertToGematria = (num: number): string => {
  const gematriaMap: [number, string][] = [
    [400, "ת"],
    [300, "ש"],
    [200, "ר"],
    [100, "ק"],
    [90, "צ"],
    [80, "פ"],
    [70, "ע"],
    [60, "ס"],
    [50, "נ"],
    [40, "מ"],
    [30, "ל"],
    [20, "כ"],
    [10, "י"],
    [9, "ט"],
    [8, "ח"],
    [7, "ז"],
    [6, "ו"],
    [5, "ה"],
    [4, "ד"],
    [3, "ג"],
    [2, "ב"],
    [1, "א"],
  ];

  let result = "";
  let remaining = num;

  for (const [value, letter] of gematriaMap) {
    while (remaining >= value) {
      result += letter;
      remaining -= value;
    }
  }

  // Fix problematic sequences:
  result = result.replace("יה", "טו").replace("יו", "טז");

  return result;
};

const ParashaText = ({
  verses,
  highlightedWordId,
  offset = 0,
  handleWordClick,
}: ParashaTextProps) => {
  // Group verses by perek if showing perek divisions
  const versesByPerek = useMemo(() => {
    return verses.reduce<Record<string, ProcessedVerse[]>>((acc, verse) => {
      const perek = verse.perek || "";
      if (!acc[perek]) acc[perek] = [];
      acc[perek].push(verse);
      return acc;
    }, {});
  }, [verses]);

  return (
    <div className="parasha-text-container">
      {Object.entries(versesByPerek).map(([perek, perekVerses], pIndex) => (
        <div key={`perek-${perek || "unknown"}`} className="perek-container">
          {perek && <h2 className="perek-heading">פרק {perek}</h2>}
          {perekVerses.map((verse, index) => (
            <div
              id={`verse-${verse.number - 1}`} // Use 0-based index for IDs
              key={`verse-${verse.number}`}
              className={`verse-container ${
                highlightedWordId?.startsWith(`${verse.number - 1}-`)
                  ? "active-verse"
                  : ""
              }`}
            >
              <div className="verse-number">
                {convertToGematria(index + 1 + (pIndex === 0 ? offset : 0))}.
              </div>
              <div className="verse-words">
                {verse.words.map((word) => (
                  <HighlightableWord
                    key={word.id}
                    id={word.id}
                    text={word.text}
                    isHighlighted={word.id === highlightedWordId}
                    onClick={() => handleWordClick(word)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ParashaText;
