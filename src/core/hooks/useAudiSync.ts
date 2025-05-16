import { useState, useEffect, useRef } from "react";
import type { ProcessedWord } from "../models/Parasha";
import { findCurrentWord, getAllWords } from "../services/highlightService";

interface UseAudioSyncProps {
  verses: { words: ProcessedWord[] }[];
  isPlaying: boolean;
  currentTime: number;
}

export const useAudioSync = ({
  verses,
  isPlaying,
  currentTime,
}: UseAudioSyncProps) => {
  const [highlightedWordId, setHighlightedWordId] = useState<string | null>(
    null
  );
  const words = useRef(getAllWords(verses));

  useEffect(() => {
    if (!isPlaying) return;

    const currentWord = findCurrentWord(words.current, currentTime);
    setHighlightedWordId(currentWord?.id || null);
  }, [currentTime, isPlaying]);

  return {
    highlightedWordId,
  };
};
