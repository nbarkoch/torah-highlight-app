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
      {Object.entries(versesByPerek).map(([perek, perekVerses], pIndex) => (
        <div key={`perek-${perek || "unknown"}`} className="perek-container">
          {perek && <h2 className="perek-heading">פרק {perek}</h2>}
          <div className="continuous-text">
            {perekVerses.map((verse, index) => {
              const verseNumG = numberToHebrew(
                index + 1 + (pIndex === 0 ? offset : 0)
              );
              const isActive = highlightedWordId?.startsWith(
                `${verse.number - 1}-`
              );

              return (
                <span
                  id={`verse-${verse.number - 1}`}
                  key={`verse-${verse.number}`}
                  className={`verse-span ${isActive ? "active-verse" : ""}`}
                >
                  {verse.words.map((word, wordIndex) => {
                    if (wordIndex === 0) {
                      // For the first word, include the verse number as a non-breaking group
                      return (
                        <span className="verse-starter" key={word.id}>
                          <span className="verse-number">{verseNumG}</span>
                          <HighlightableWord
                            id={word.id}
                            text={word.text}
                            isHighlighted={word.id === highlightedWordId}
                            onClick={() => handleWordClick(word)}
                          />
                        </span>
                      );
                    } else {
                      // For other words, render normally
                      return (
                        <HighlightableWord
                          key={word.id}
                          id={word.id}
                          text={word.text}
                          isHighlighted={word.id === highlightedWordId}
                          onClick={() => handleWordClick(word)}
                        />
                      );
                    }
                  })}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParashaText;
