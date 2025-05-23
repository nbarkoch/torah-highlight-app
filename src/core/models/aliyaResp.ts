type TWord = {
  text: {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  start: number;
  end: number;
};

type PerekStarts = {
  perek: string;
  start_index: number;
};

export type Stop = { type: "פ" | "ס"; verse_index: number };

export type AliyaData = {
  verses: string[];
  perek_starts: PerekStarts[];
  t_words: TWord[];
  start_offset: number;
  stops: Stop[];
};
