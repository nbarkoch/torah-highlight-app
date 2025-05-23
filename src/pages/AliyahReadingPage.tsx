import { useState, useEffect } from "react";
import ParashaText from "../components/ParashaText";
import ReadingControls from "../components/ReadingControls";

import { parseAliyahJson } from "../utils/parser";
import type { ProcessedAliyah, ProcessedWord } from "../core/models/Parasha";
import { useWebAudio } from "../core/hooks/useWebAudio";
import { useAudioSync } from "../core/hooks/useAudiSync";
import type { AliyaAudioData, AliyaData } from "../core/models/aliyaResp";
import TorahPointer from "../components/TorahPointer/TorahPointer";
import TextToggleSwitch from "../components/TextToggleSwitch";
import NosachSelector from "~/components/NosachSelector/NosachSelector";
import bereshitAudioAshkenaz from "../mocks/bereshit_a.json";
interface AliyahReadingPageProps {
  jsonData: AliyaData;
}

const AliyahReadingPage = ({ jsonData }: AliyahReadingPageProps) => {
  const [aliyaFinalhData, setAliyahFinalData] =
    useState<ProcessedAliyah | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [jsonAudioData, setJsonAudioData] = useState(bereshitAudioAshkenaz);
  const [audioUrl, setAudioUrl] = useState("./bereshit/a_1.mp3");

  const handleNosachChange = (
    audioPath: string,
    jsonAudioData: AliyaAudioData
  ) => {
    setLoading(true);
    setJsonAudioData(jsonAudioData);
    setAudioUrl(audioPath);
    setLoading(false);
  };

  // Process the aliyah data when available
  useEffect(() => {
    try {
      // Parse the JSON data
      const processedData = parseAliyahJson(
        { ...jsonData, ...jsonAudioData },
        audioUrl
      );

      setAliyahFinalData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing aliyah data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process aliyah data"
      );
      setLoading(false);
    }
  }, [jsonData, audioUrl, jsonAudioData]);

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

  if (error || !aliyaFinalhData) {
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

  return (
    <AliyahReader
      aliyaFinalhData={aliyaFinalhData}
      handleNosachChange={handleNosachChange}
    />
  );
};

interface AliyahReaderProps {
  aliyaFinalhData: ProcessedAliyah;
  handleNosachChange: (audioUrl: string, jsonAudioData: AliyaAudioData) => void;
}

const AliyahReader = ({
  aliyaFinalhData,
  handleNosachChange,
}: AliyahReaderProps) => {
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
    audioUrl: aliyaFinalhData.audioUrl,
  });

  // Handler for keyboard events at the container level
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      setShowPlainText(!showPlainText);
    }
  };

  const [highlightedWordId, setHighlightedWordId] = useState<string | null>(
    null
  );

  useAudioSync({
    verses: aliyaFinalhData.verses,
    isPlaying,
    currentTime,
    setHighlightedWordId,
  });

  const [showPlainText, setShowPlainText] = useState(false);

  const handleWordClick = (clickedWord?: ProcessedWord) => {
    if (clickedWord) {
      seek(clickedWord.startTime);
      setHighlightedWordId(clickedWord.id);
    }
  };

  const $handleNosachChange = (
    audioUrl: string,
    jsonAudioData: AliyaAudioData
  ) => {
    if (isPlaying) {
      togglePlayPause();
    }
    handleNosachChange(audioUrl, jsonAudioData);
  };

  return (
    <div className="aliyah-reader-container" onKeyDown={handleKeyDown}>
      <header className="aliyah-header">
        <h1>{aliyaFinalhData.name}</h1>
        <p>קריאה אינטראקטיבית בתורה</p>
        <p className="english-subtitle">Interactive Torah Reading</p>
      </header>

      <TextToggleSwitch
        isPlainText={showPlainText}
        onChange={setShowPlainText}
      />

      <NosachSelector onNosachChange={$handleNosachChange} initialNosach="a" />

      <TorahPointer
        highlightedWordId={highlightedWordId}
        inactivityTimeout={5000}
        isVisible={showPlainText}
        isPlaying={isPlaying}
      />

      <div className="torah-content">
        <ParashaText
          verses={aliyaFinalhData.verses}
          highlightedWordId={highlightedWordId}
          offset={aliyaFinalhData.offset}
          handleWordClick={handleWordClick}
          showPlainText={showPlainText}
          stops={aliyaFinalhData.stops}
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
      <div className={`sticky-controls-wrapper`}>
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

export default AliyahReadingPage;
