import { useState, useEffect } from "react";
import ParashaText from "../components/ParashaText";
import ReadingControls from "../components/ReadingControls";

import { parseAliyahJson } from "../utils/parser";
import type { ProcessedAliyah } from "../core/models/Parasha";
import { useWebAudio } from "../core/hooks/useWebAudio";
import { useAudioSync } from "../core/hooks/useAudiSync";
import type { AliyaData } from "../core/models/aliyaResp";

interface AliyahReadingPageProps {
  jsonData: AliyaData;
  audioUrl: string;
}

const AliyahReadingPage = ({ jsonData, audioUrl }: AliyahReadingPageProps) => {
  const [aliyahData, setAliyahData] = useState<ProcessedAliyah | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Process the aliyah data when available
  useEffect(() => {
    try {
      // Parse the JSON data
      const processedData = parseAliyahJson(jsonData, audioUrl);

      setAliyahData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing aliyah data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process aliyah data"
      );
      setLoading(false);
    }
  }, [jsonData, audioUrl]);

  // If still loading or there's an error, show a message
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Processing Torah text and audio data...</p>
      </div>
    );
  }

  if (error || !aliyahData) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || "Unknown error occurred while processing the data"}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return <AliyahReader aliyahData={aliyahData} />;
};

interface AliyahReaderProps {
  aliyahData: ProcessedAliyah;
}

const AliyahReader = ({ aliyahData }: AliyahReaderProps) => {
  // Web-specific audio handling
  const {
    isPlaying,
    duration,
    currentTime,
    togglePlayPause,
    seek,
    setPlaybackRate,
  } = useWebAudio({
    audioUrl: aliyahData.audioUrl,
  });

  // Platform-agnostic synchronization logic
  const { highlightedWordId } = useAudioSync({
    verses: aliyahData.verses,
    isPlaying,
    currentTime,
  });

  // Track the current verse for scrolling
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  // Set up event listeners for word click events
  useEffect(() => {
    const handleWordClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.wordId === "string") {
        // Extract verse index from the word ID
        const verseIndex = parseInt(
          customEvent.detail.wordId.split("-")[0],
          10
        );
        if (!isNaN(verseIndex)) {
          setCurrentVerseIndex(verseIndex);
        }
      }
    };

    document.addEventListener("wordClick", handleWordClick);

    return () => {
      document.removeEventListener("wordClick", handleWordClick);
    };
  }, []);

  // Find which verse contains the highlighted word
  useEffect(() => {
    if (!highlightedWordId) return;

    // Extract verse index from the word ID (format: "verseIndex-wordIndex")
    const verseIndex = parseInt(highlightedWordId.split("-")[0], 10);

    if (!isNaN(verseIndex) && verseIndex !== currentVerseIndex) {
      setCurrentVerseIndex(verseIndex);

      // Find the verse element and scroll to it smoothly
      const verseElement = document.getElementById(`verse-${verseIndex}`);
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedWordId, currentVerseIndex]);

  return (
    <div className="aliyah-reader-container">
      <header className="aliyah-header">
        <h1>{aliyahData.name} </h1>
        <p>Interactive Torah Reading</p>
      </header>

      <div className="torah-content">
        <ParashaText
          verses={aliyahData.verses}
          highlightedWordId={highlightedWordId}
          offset={aliyahData.offset}
        />

        <ReadingControls
          isPlaying={isPlaying}
          duration={duration}
          currentTime={currentTime}
          onPlayPause={togglePlayPause}
          onSeek={seek}
          onRateChange={setPlaybackRate}
        />

        <div className="reading-info">
          <p>
            <strong>Current Position:</strong> {formatTime(currentTime)} /{" "}
            {formatTime(duration)}
          </p>
          {highlightedWordId && (
            <p>
              <strong>Current Verse:</strong> {currentVerseIndex + 1}
            </p>
          )}
        </div>
      </div>

      <div className="reading-instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Press the play button to begin the reading</li>
          <li>Words will be highlighted as they are read</li>
          <li>Use the slider to navigate to a specific part of the reading</li>
          <li>Click on any word to jump to that position in the audio</li>
          <li>Adjust the playback speed with the rate buttons</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to format time as MM:SS
const formatTime = (time: number) => {
  const totalSeconds = Math.floor(time);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default AliyahReadingPage;
