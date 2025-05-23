import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { ProcessedVerse, ProcessedWord } from "../core/models/Parasha";
import HighlightableWord from "./HighlightableWord";
import { numberToHebrew } from "../utils/gematria";
import type { Stop } from "~/core/models/aliyaResp";

interface ParashaTextProps {
  verses: ProcessedVerse[];
  highlightedWordId: string | null;
  offset?: number;
  handleWordClick: (word?: ProcessedWord) => void;
  stops: Stop[];
  showPlainText: boolean;
}

interface EnhancedProcessedWord extends ProcessedWord {
  verseIndex: number;
  wordIndex: number;
  isFirst: boolean;
  isLast: boolean;
  verseNumG: string;
  hasSamechAfter?: boolean; // New property to track if this word has a ס break after it
}

interface LineData {
  id: string;
  lineWords: EnhancedProcessedWord[];
  verseNumbers: Set<number>;
  isLastLineOfPiska?: boolean;
  perekSymbol?: string; // Move perek symbol to line level
}

interface PiskaData {
  id: string;
  lines: LineData[];
}

const ParashaText = ({
  verses,
  highlightedWordId,
  offset = 0,
  handleWordClick,
  stops,
  showPlainText,
}: ParashaTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formattedPiskas, setFormattedPiskas] = useState<PiskaData[]>([]);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  // Process all verses into a flat array of words with breaks
  const allProcessedWords = useMemo(() => {
    const words: EnhancedProcessedWord[] = [];
    const separatorPositions: Array<{
      afterWordIndex: number;
      type: Stop["type"];
    }> = [];

    let wordCounter = 0;
    let lastPerek: string | undefined = undefined;
    let verseIdexToPerek = 0;
    verses.forEach((verse, verseIndex) => {
      if (lastPerek !== verse.perek) {
        verseIdexToPerek = 0;
      }
      verseIdexToPerek += 1;
      const verseNumG = numberToHebrew(verseIdexToPerek + offset);

      lastPerek = verse.perek;
      // Check if there's a samech stop after this verse
      const samechStop = stops.find(
        (stop) => stop.verse_index === verseIndex && stop.type === "ס"
      );

      verse.words.forEach((word, wordIndex) => {
        const isLastWordInVerse = wordIndex === verse.words.length - 1;

        const enhancedWord: EnhancedProcessedWord = {
          ...word,
          verseIndex,
          wordIndex,
          isFirst: wordIndex === 0,
          isLast: isLastWordInVerse,
          verseNumG,
          hasSamechAfter: isLastWordInVerse && !!samechStop,
        };

        words.push(enhancedWord);
        wordCounter++;
      });

      // Check if there's a separator after this verse
      const stop = stops.find((stop) => stop.verse_index === verseIndex);
      if (stop) {
        separatorPositions.push({
          afterWordIndex: wordCounter - 1,
          type: stop.type,
        });
      }
    });

    return { words, separatorPositions };
  }, [verses, offset, stops]);

  const processWordsIntoLines = useCallback(
    (
      words: EnhancedProcessedWord[],
      piskaIndex: number,
      currentLastPerek?: string
    ): LineData[] => {
      if (!containerRef.current) return [];

      // Create a temporary container to measure word positions
      const tempContainer = document.createElement("div");
      tempContainer.className = "continuous-text measuring-container";
      tempContainer.style.width = `${containerRef.current.clientWidth - 48}px`;
      tempContainer.style.position = "absolute";
      tempContainer.style.visibility = "hidden";
      tempContainer.style.direction = "rtl";
      tempContainer.style.right = "0";
      tempContainer.style.top = "0";

      // Add word elements to measure
      words.forEach((word) => {
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

        // Add samech spacer if this word has one
        if (word.hasSamechAfter) {
          const spacer = document.createElement("span");
          spacer.className = "samech-spacer";
          spacer.style.display = "inline-block";
          spacer.style.width = "10%";
          spacer.style.minWidth = "100px";
          tempContainer.appendChild(spacer);
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
      let lastPerek: string | undefined = currentLastPerek; // Use the passed value

      const wordElements = tempContainer.querySelectorAll(".word");

      wordElements.forEach((element) => {
        const wordId = element.getAttribute("data-word-id");
        const wordData = words.find((w) => w.id === wordId);

        if (!wordData) return;

        const rect = element.getBoundingClientRect();

        // If this is a new line
        if (
          currentTopPosition === null ||
          Math.abs(rect.top - currentTopPosition) > 5
        ) {
          if (currentLine.length > 0) {
            lines.push({
              id: `piska-${piskaIndex}-line-${lineIndex}`,
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
          id: `piska-${piskaIndex}-line-${lineIndex}`,
          lineWords: [...currentLine],
          verseNumbers: new Set(currentVerseNumbers),
        });
      }

      // Clean up the temporary element
      document.body.removeChild(tempContainer);

      // Now assign perek symbols to lines - only when a new perek appears
      lines.forEach((line) => {
        // Find if any word in this line starts a new perek
        for (const word of line.lineWords) {
          if (word.isFirst) {
            const verse = verses[word.verseIndex];
            if (verse.perek && verse.perek !== lastPerek) {
              line.perekSymbol = `פרק ${verse.perek}`;
              lastPerek = verse.perek;
              break; // Only one perek per line
            }
          }
        }
      });

      return lines;
    },
    [verses]
  );

  // Logic to format words into piskas with lines
  useEffect(() => {
    if (!containerRef.current || allProcessedWords.words.length === 0) return;

    const { words, separatorPositions } = allProcessedWords;
    const piskas: PiskaData[] = [];

    // Split words into piskas based on פ separators
    let currentPiskaWords: EnhancedProcessedWord[] = [];
    let piskaCounter = 0;
    let globalLastPerek: string | undefined = undefined; // Track across all piskas

    const pBreakPositions = separatorPositions
      .filter((sep) => sep.type === "פ")
      .map((sep) => sep.afterWordIndex);

    words.forEach((word, index) => {
      currentPiskaWords.push(word);

      // Check if this is the end of a piska (there's a פ break after this word)
      if (pBreakPositions.includes(index)) {
        // Process current piska into lines
        const piskaLines = processWordsIntoLines(
          currentPiskaWords,
          piskaCounter,
          globalLastPerek
        );

        // Update global last perek from the processed lines
        piskaLines.forEach((line) => {
          if (line.perekSymbol) {
            globalLastPerek = line.perekSymbol.replace("פרק ", "");
          }
        });

        // Mark the last line as the last line of the piska
        if (piskaLines.length > 0) {
          piskaLines[piskaLines.length - 1].isLastLineOfPiska = true;
        }

        piskas.push({
          id: `piska-${piskaCounter}`,
          lines: piskaLines,
        });

        currentPiskaWords = [];
        piskaCounter++;
      }
    });

    // Handle remaining words if no final פ break
    if (currentPiskaWords.length > 0) {
      const piskaLines = processWordsIntoLines(
        currentPiskaWords,
        piskaCounter,
        globalLastPerek
      );
      if (piskaLines.length > 0) {
        piskaLines[piskaLines.length - 1].isLastLineOfPiska = true;
      }
      piskas.push({
        id: `piska-${piskaCounter}`,
        lines: piskaLines,
      });
    }

    setFormattedPiskas(piskas);
  }, [
    allProcessedWords,
    containerRef.current?.clientWidth,
    offset,
    processWordsIntoLines,
    verses,
  ]);

  // Find which line contains the highlighted word and set it as active
  useEffect(() => {
    if (!highlightedWordId) {
      setActiveLineId(null);
      return;
    }

    for (const piska of formattedPiskas) {
      for (const line of piska.lines) {
        if (line.lineWords.some((word) => word.id === highlightedWordId)) {
          setActiveLineId(line.id);
          return;
        }
      }
    }
  }, [highlightedWordId, formattedPiskas]);

  // Auto-scroll to active line
  useEffect(() => {
    if (!activeLineId) return;

    setTimeout(() => {
      const lineElement = document.getElementById(activeLineId);
      if (lineElement) {
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
  }, [activeLineId]);

  return (
    <div className="parasha-text-container" tabIndex={-1} ref={containerRef}>
      {formattedPiskas.map((piska) => (
        <div key={piska.id} className="piska-container">
          {piska.lines.map((line) => {
            const isActiveLine = line.id === activeLineId;
            const justifyContent = line.isLastLineOfPiska
              ? "flex-start"
              : "space-between";

            return (
              <div
                key={line.id}
                id={line.id}
                className={`torah-line ${
                  !showPlainText && isActiveLine
                    ? "active-line current-reading-line"
                    : ""
                }`}
                dir="rtl"
                style={{
                  justifyContent,
                  position: "relative", // Enable absolute positioning for perek symbol
                }}
              >
                {/* Perek symbol positioned absolutely on the right */}
                {line.perekSymbol && (
                  <span
                    className="perek-indicator"
                    style={{
                      position: "absolute",
                      right: "-80px", // Position outside the content area
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "25px",
                      color: "#666",
                      fontWeight: "bold",
                      fontFamily: "David Libre, serif",
                      opacity: showPlainText ? 0 : 0.8,
                      whiteSpace: "nowrap",
                      pointerEvents: "none", // Don't interfere with text selection
                      userSelect: "none",
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {line.perekSymbol}
                  </span>
                )}

                {line.lineWords.map((word) => {
                  // Add verse numbers before the first word of each verse in the line
                  const lineIndex = piska.lines.findIndex(
                    (l) => l.id === line.id
                  );
                  const showVerseNumber =
                    word.isFirst &&
                    (lineIndex === 0 ||
                      !piska.lines[lineIndex - 1].verseNumbers.has(
                        word.verseIndex
                      ));

                  const wordElement = showVerseNumber ? (
                    <span
                      className="verse-starter"
                      key={word.id}
                      id={`verse-${word.verseIndex}`}
                    >
                      <span className="verse-number">
                        <span
                          style={{
                            position: "absolute",
                            left: -2.5,
                            bottom: -15,
                            opacity: showPlainText ? 0 : 0.8,
                          }}
                        >
                          {word.verseNumG}
                        </span>
                      </span>
                      <HighlightableWord
                        id={word.id}
                        text={word.text}
                        isHighlighted={
                          !showPlainText && word.id === highlightedWordId
                        }
                        onClick={() => handleWordClick(word)}
                        showPlainText={showPlainText}
                      />
                    </span>
                  ) : (
                    <HighlightableWord
                      key={word.id}
                      id={word.id}
                      text={word.text}
                      isHighlighted={
                        !showPlainText && word.id === highlightedWordId
                      }
                      onClick={() => handleWordClick(word)}
                      showPlainText={showPlainText}
                    />
                  );

                  // Add samech spacer after this word if needed
                  if (word.hasSamechAfter) {
                    return (
                      <div key={`${word.id}-with-samech`}>
                        {wordElement}
                        <span
                          className="samech-spacer"
                          style={{
                            display: "inline-block",
                            minWidth: "100px",
                            height: "1px", // Invisible but takes up space
                          }}
                        />
                      </div>
                    );
                  }

                  return wordElement;
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
