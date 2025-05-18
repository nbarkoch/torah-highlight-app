import { useState, useEffect, useRef } from "react";
import ParashaText from "../components/ParashaText";
import ReadingControls from "../components/ReadingControls";

import { parseAliyahJson } from "../utils/parser";
import type { ProcessedAliyah, ProcessedWord } from "../core/models/Parasha";
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
        <p>מעבד את הטקסט והשמע של התורה...</p>
        <p className="loading-subtitle">
          Processing Torah text and audio data...
        </p>
      </div>
    );
  }

  if (error || !aliyahData) {
    return (
      <div className="error-container">
        <h2>שגיאה</h2>
        <p>{error || "אירעה שגיאה לא ידועה בעת עיבוד הנתונים"}</p>
        <p className="error-subtitle">
          {error || "Unknown error occurred while processing the data"}
        </p>
        <button onClick={() => window.location.reload()}>
          נסה שוב / Try Again
        </button>
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
    isLoading,
    error,
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
  const [showControls, setShowControls] = useState(true);
  const lastScrollPos = useRef(0);

  // Handle scroll to control visibility of the sticky player
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (currentScrollPos > lastScrollPos.current + 20) {
        setShowControls(false);
      } else if (currentScrollPos < lastScrollPos.current - 20) {
        setShowControls(true);
      }
      lastScrollPos.current = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWordClick = (clickedWord?: ProcessedWord) => {
    if (clickedWord) {
      const verseIndex = parseInt(clickedWord.id.split("-")[0], 10);
      setCurrentVerseIndex(verseIndex);
      seek(clickedWord.startTime);
    }
  };

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
        // Calculate an offset to account for the sticky controls

        // Calculate the target scroll position manually
        const elementRect = verseElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        const elementHeight = elementRect.height;

        // Center the element accounting for the sticky controls
        const targetScrollPosition =
          elementTop - window.innerHeight / 2 + elementHeight / 2;

        // Scroll to the calculated position
        window.scrollTo({
          top: targetScrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [highlightedWordId, currentVerseIndex]);

  return (
    <div className="aliyah-reader-container">
      <header className="aliyah-header">
        <h1>{aliyahData.name}</h1>
        <p>קריאה אינטראקטיבית בתורה</p>
        <p className="english-subtitle">Interactive Torah Reading</p>
      </header>

      <div className="torah-content">
        <ParashaText
          verses={aliyahData.verses}
          highlightedWordId={highlightedWordId}
          offset={aliyahData.offset}
          handleWordClick={handleWordClick}
        />
      </div>

      {error && (
        <div className="audio-error-container">
          <h3>שגיאה בטעינת השמע / Audio Error</h3>
          <p>{error}</p>
          <p>נסה לטעון מחדש את הדף או להשתמש בדפדפן אחר.</p>
          <p>Try refreshing the page or using a different browser.</p>
        </div>
      )}

      <div className="reading-instructions">
        <h3>הוראות / Instructions</h3>
        <ul>
          <li>לחץ על כפתור הניגון כדי להתחיל את הקריאה</li>
          <li>המילים יודגשו בזמן שהם נקראות</li>
          <li>השתמש במחוון כדי לנווט לחלק ספציפי של הקריאה</li>
          <li>לחץ על כל מילה כדי לקפוץ לאותו מיקום בשמע</li>
          <li>התאם את מהירות ההשמעה עם כפתורי הקצב</li>
        </ul>
        <div className="english-instructions">
          <ul>
            <li>Press the play button to begin the reading</li>
            <li>Words will be highlighted as they are read</li>
            <li>
              Use the slider to navigate to a specific part of the reading
            </li>
            <li>Click on any word to jump to that position in the audio</li>
            <li>Adjust the playback speed with the rate buttons</li>
          </ul>
        </div>
      </div>

      {/* Fixed controls at the bottom */}
      <div
        className={`sticky-controls-wrapper ${showControls ? "" : "hidden"}`}
      >
        <div className="reading-info">
          <div>
            <strong>מיקום נוכחי:</strong> {formatTime(currentTime)} /{" "}
            {formatTime(duration)}
          </div>
          {highlightedWordId && (
            <div>
              <strong>פסוק נוכחי:</strong> {currentVerseIndex + 1}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="audio-loading-indicator">
            <div className="loading-spinner small"></div>
            <span>טוען שמע... / Loading audio...</span>
          </div>
        ) : (
          <ReadingControls
            isPlaying={isPlaying}
            duration={duration}
            currentTime={currentTime}
            onPlayPause={togglePlayPause}
            onSeek={seek}
            onRateChange={setPlaybackRate}
          />
        )}
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
