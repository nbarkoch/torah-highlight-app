import { useEffect, useRef } from "react";
import type { ProcessedWord } from "../models/Parasha";
import { findCurrentWord, getAllWords } from "../services/highlightService";

interface UseAudioSyncProps {
  verses: { words: ProcessedWord[] }[];
  isPlaying: boolean;
  currentTime: number;
  setHighlightedWordId: (wordId: string | null) => void;
}

export const useAudioSync = ({
  verses,
  isPlaying,
  currentTime,
  setHighlightedWordId,
}: UseAudioSyncProps) => {
  const words = useRef(getAllWords(verses));

  useEffect(() => {
    if (isPlaying) {
      const currentWord = findCurrentWord(words.current, currentTime);
      setHighlightedWordId(currentWord?.id || null);
    }
  }, [currentTime, isPlaying, setHighlightedWordId]);

  useEffect(() => {
    words.current = getAllWords(verses);
    setHighlightedWordId(null);
  }, [setHighlightedWordId, verses]);
};
