import { useMemo } from "react";
import type { ProcessedVerse, ProcessedWord } from "../core/models/Parasha";
import HighlightableWord from "./HighlightableWord";
import { numberToHebrew } from "../utils/gematria";

interface ParashaTextProps {
  verses: ProcessedVerse[];
  highlightedWordId: string | null;
  offset?: number;
  handleWordClick: (word?: ProcessedWord) => void;
}

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
      {Object.entries(versesByPerek).map(([perek, perekVerses], pIndex) => {
        return (
          <div key={`perek-${perek || "unknown"}`} className="perek-container">
            {perek && (
              <div className="perek-header">
                <h2 className="perek-heading">פרק {perek}</h2>
                <div className="perek-decoration"></div>
              </div>
            )}
            <div className="verses-list">
              {perekVerses.map((verse, index) => {
                const verseNumG = numberToHebrew(
                  index + 1 + (pIndex === 0 ? offset : 0)
                );
                const isActive = highlightedWordId?.startsWith(
                  `${verse.number - 1}-`
                );
                return (
                  <div
                    id={`verse-${verse.number - 1}`}
                    key={`verse-${verse.number}`}
                    className={`verse-container ${
                      isActive ? "active-verse" : ""
                    }`}
                  >
                    <div className="verse-number">{verseNumG}</div>
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
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ParashaText;
