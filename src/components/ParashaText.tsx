import { useMemo, useState } from "react";
import type { ProcessedVerse, ProcessedWord } from "../core/models/Parasha";
import HighlightableWord from "./HighlightableWord";
import { numberToHebrew } from "../utils/gematria";
import TextToggleSwitch from "./TextToggleSwitch";
import { removeNikkudAndTaamim } from "../utils/forRead";

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
  const [showPlainText, setShowPlainText] = useState(false);

  // Group verses by perek if showing perek divisions
  const versesByPerek = useMemo(() => {
    return verses.reduce<Record<string, ProcessedVerse[]>>((acc, verse) => {
      const perek = verse.perek || "";
      if (!acc[perek]) acc[perek] = [];
      acc[perek].push(verse);
      return acc;
    }, {});
  }, [verses]);

  // Process words to handle with/without nikkud display
  const processWord = (text: string) => {
    return showPlainText ? removeNikkudAndTaamim(text) : text;
  };

  // Handler for keyboard events at the container level
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      setShowPlainText(!showPlainText);
    }
  };

  // Flatten all words into a single array for the flex layout
  const getAllWordsFromVerse = (
    verse: ProcessedVerse,
    verseIndex: number,
    verseNumG: string
  ) => {
    return verse.words.map((word, wordIndex) => {
      return {
        ...word,
        verseIndex,
        wordIndex,
        isFirst: wordIndex === 0,
        verseNumG,
      };
    });
  };

  return (
    <div
      className="parasha-text-container"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <TextToggleSwitch
        isPlainText={showPlainText}
        onChange={setShowPlainText}
      />

      {Object.entries(versesByPerek).map(([perek, perekVerses], pIndex) => {
        // Get all words for this perek in a flattened array
        const allWords = perekVerses.flatMap((verse, index) => {
          const verseNumG = numberToHebrew(
            index + 1 + (pIndex === 0 ? offset : 0)
          );
          return getAllWordsFromVerse(verse, verse.number - 1, verseNumG);
        });

        return (
          <div key={`perek-${perek || "unknown"}`}>
            {perek && <h2 className="perek-heading">פרק {perek}</h2>}
            <div className="continuous-text">
              {allWords.map((word) => {
                if (word.isFirst) {
                  // For the first word in a verse, include the verse number
                  return (
                    <span
                      className="verse-starter"
                      key={word.id}
                      id={`verse-${word.verseIndex}`}
                    >
                      <span className="verse-number">
                        {!showPlainText ? word.verseNumG : " "}
                      </span>
                      <HighlightableWord
                        id={word.id}
                        text={processWord(word.text)}
                        isHighlighted={word.id === highlightedWordId}
                        onClick={() => handleWordClick(word)}
                        originalText={word.text}
                      />
                    </span>
                  );
                } else {
                  // For other words, render normally
                  return (
                    <HighlightableWord
                      key={word.id}
                      id={word.id}
                      text={processWord(word.text)}
                      originalText={word.text}
                      isHighlighted={word.id === highlightedWordId}
                      onClick={() => handleWordClick(word)}
                    />
                  );
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ParashaText;
