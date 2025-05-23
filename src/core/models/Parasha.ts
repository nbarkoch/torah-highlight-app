import type { Stop } from "./aliyaResp";

export interface Word {
  word: string;
  start: number; // seconds
  end: number; // seconds
}

export interface VerseData {
  text: string;
  words: Word[];
  start: number;
  end: number;
}

export interface PerekStart {
  perek: string;
  start_index: number;
}

export interface Aliyah {
  id: string;
  name: string;
  verses: VerseData[];
  perek_starts: PerekStart[];
  audioUrl: string;
  offset: number;
  stops: Stop[];
}

// Holds the complete parsed data structure for rendering
export interface ProcessedAliyah {
  id: string;
  name: string;
  verses: ProcessedVerse[];
  audioUrl: string;
  offset: number;
  stops: Stop[];
}

export interface ProcessedVerse {
  number: number;
  text: string;
  words: ProcessedWord[];
  perek?: string;
  stop?: "פ" | "ס";
}

export interface ProcessedWord {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
}
