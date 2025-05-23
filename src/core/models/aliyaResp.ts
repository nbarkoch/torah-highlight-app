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
  verses: {
    verse_number: string;
    text: string;
  }[];
  perek_starts: PerekStarts[];
  start_offset: number;
  stops: Stop[];
  parasha_num: number;
  aliya: number;
  aliya_name: string;
};

export type AliyaAudioData = {
  t_words: TWord[];
};
