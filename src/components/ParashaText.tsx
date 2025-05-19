import { useMemo, useState, useRef, useEffect } from "react";
import type { ProcessedVerse, ProcessedWord } from "../core/models/Parasha";
import HighlightableWord from "./HighlightableWord";
import { numberToHebrew } from "../utils/gematria";
import TextToggleSwitch from "./TextToggleSwitch";

interface ParashaTextProps {
  verses: ProcessedVerse[];
  highlightedWordId: string | null;
  offset?: number;
  handleWordClick: (word?: ProcessedWord) => void;
}

interface EnhancedProcessedWord extends ProcessedWord {
  verseIndex: number;
  wordIndex: number;
  isFirst: boolean;
  verseNumG: string;
}

interface LineData {
  id: string;
  lineWords: EnhancedProcessedWord[];
  verseNumbers: Set<number>;
}

const ParashaText = ({
  verses,
  highlightedWordId,
  offset = 0,
  handleWordClick,
}: ParashaTextProps) => {
  const [showPlainText, setShowPlainText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [formattedVerses, setFormattedVerses] = useState<
    Array<{
      perek: string;
      lines: LineData[];
    }>
  >([]);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  // Group verses by perek if showing perek divisions
  const versesByPerek = useMemo(() => {
    return verses.reduce<Record<string, ProcessedVerse[]>>((acc, verse) => {
      const perek = verse.perek || "";
      if (!acc[perek]) acc[perek] = [];
      acc[perek].push(verse);
      return acc;
    }, {});
  }, [verses]);

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
  ): EnhancedProcessedWord[] => {
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

  // Logic to format verses into lines
  useEffect(() => {
    if (!containerRef.current) return;

    const formatted = Object.entries(versesByPerek).map(
      ([perek, perekVerses]) => {
        // First, get all words for this perek
        const allWords = perekVerses.flatMap((verse, index) => {
          const verseNumG = numberToHebrew(
            index + 1 + (perek === verses[0]?.perek ? offset : 0)
          );
          return getAllWordsFromVerse(verse, verse.number - 1, verseNumG);
        });

        // Create a temporary container to measure word positions
        const tempContainer = document.createElement("div");
        tempContainer.className = "continuous-text measuring-container";
        tempContainer.style.width = `${
          containerRef.current?.clientWidth ?? 0 - 48
        }px`; // Approximate padding
        tempContainer.style.position = "absolute";
        tempContainer.style.visibility = "hidden";
        tempContainer.style.direction = "rtl";
        tempContainer.style.right = "0";
        tempContainer.style.top = "0";

        // Add word elements to measure
        allWords.forEach((word) => {
          const span = document.createElement("span");
          span.className = "word measuring-word";
          span.textContent = word.text;
          span.dataset.wordId = word.id;
          span.style.display = "inline-block";

          // Add verse numbers for first words
          if (word.isFirst) {
            const verseNumSpan = document.createElement("span");
            verseNumSpan.className = "verse-number";
            verseNumSpan.textContent = word.verseNumG;
            const wordContainer = document.createElement("span");
            wordContainer.className = "verse-starter";
            wordContainer.appendChild(verseNumSpan);
            wordContainer.appendChild(span);
            tempContainer.appendChild(wordContainer);
          } else {
            tempContainer.appendChild(span);
          }
        });

        // Add to DOM temporarily to measure
        document.body.appendChild(tempContainer);

        // Now measure positions and group by lines
        const lines: LineData[] = [];

        let currentLine: EnhancedProcessedWord[] = [];
        let currentTopPosition: number | null = null;
        let currentVerseNumbers = new Set<number>();
        let lineIndex = 0;

        const wordElements = tempContainer.querySelectorAll(".word");

        wordElements.forEach((element) => {
          const wordId = element.getAttribute("data-word-id");
          const wordData = allWords.find((w) => w.id === wordId);

          if (!wordData) return;

          const rect = element.getBoundingClientRect();

          // If this is a new line
          if (
            currentTopPosition === null ||
            Math.abs(rect.top - currentTopPosition) > 5
          ) {
            if (currentLine.length > 0) {
              lines.push({
                id: `line-${perek}-${lineIndex}`,
                lineWords: [...currentLine],
                verseNumbers: new Set(currentVerseNumbers),
              });
              lineIndex++;
              currentLine = [];
              currentVerseNumbers = new Set<number>();
            }
            currentTopPosition = rect.top;
          }

          currentLine.push(wordData);
          currentVerseNumbers.add(wordData.verseIndex);
        });

        // Add the last line if not empty
        if (currentLine.length > 0) {
          lines.push({
            id: `line-${perek}-${lineIndex}`,
            lineWords: [...currentLine],
            verseNumbers: new Set(currentVerseNumbers),
          });
        }

        // Clean up the temporary element
        document.body.removeChild(tempContainer);

        return {
          perek,
          lines,
        };
      }
    );

    setFormattedVerses(formatted);
  }, [versesByPerek, containerRef.current?.clientWidth, offset, verses]);

  // Find which line contains the highlighted word and set it as active
  useEffect(() => {
    if (!highlightedWordId) {
      setActiveLineId(null);
      return;
    }

    // Find which line contains the highlighted word
    for (const perekData of formattedVerses) {
      for (const line of perekData.lines) {
        if (line.lineWords.some((word) => word.id === highlightedWordId)) {
          setActiveLineId(line.id);

          // Scroll to the active line
          setTimeout(() => {
            const lineElement = document.getElementById(line.id);
            if (lineElement) {
              // Calculate scroll position to center the line
              const rect = lineElement.getBoundingClientRect();
              const scrollTop =
                rect.top +
                window.pageYOffset -
                window.innerHeight / 2 +
                rect.height / 2 +
                100;

              window.scrollTo({
                top: scrollTop,
                behavior: "smooth",
              });
            }
          }, 100);

          return;
        }
      }
    }
  }, [highlightedWordId, formattedVerses]);

  return (
    <div
      className="parasha-text-container"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <TextToggleSwitch
        isPlainText={showPlainText}
        onChange={setShowPlainText}
      />

      {formattedVerses.map(({ perek, lines }, perekIndex) => (
        <div
          key={`perek-${perek || `unknown-${perekIndex}`}`}
          className="perek-container"
        >
          {perek && <h2 className="perek-heading">פרק {perek}</h2>}

          {lines.map((line) => {
            const isActiveLine = line.id === activeLineId;

            return (
              <div
                key={line.id}
                id={line.id}
                className={`torah-line ${
                  isActiveLine ? "active-line current-reading-line" : ""
                }`}
                dir="rtl"
              >
                {line.lineWords.map((word) => {
                  // Add verse numbers before the first word of each verse in the line
                  const lineIndex = lines.findIndex((l) => l.id === line.id);
                  const showVerseNumber =
                    word.isFirst &&
                    (lineIndex === 0 ||
                      !lines[lineIndex - 1].verseNumbers.has(word.verseIndex));

                  if (showVerseNumber) {
                    return (
                      <span
                        className="verse-starter"
                        key={word.id}
                        id={`verse-${word.verseIndex}`}
                      >
                        <span
                          className="verse-number"
                          style={{ opacity: showPlainText ? 0 : 1 }}
                        >
                          {word.verseNumG}
                        </span>
                        <HighlightableWord
                          key={word.id}
                          id={word.id}
                          text={word.text}
                          isHighlighted={word.id === highlightedWordId}
                          onClick={() => handleWordClick(word)}
                          showPlainText={showPlainText}
                        />
                      </span>
                    );
                  } else {
                    return (
                      <HighlightableWord
                        key={word.id}
                        id={word.id}
                        text={word.text}
                        isHighlighted={word.id === highlightedWordId}
                        onClick={() => handleWordClick(word)}
                        showPlainText={showPlainText}
                      />
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ParashaText;
