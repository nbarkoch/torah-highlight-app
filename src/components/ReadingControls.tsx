import { useState, useEffect } from "react";

interface ReadingControlsProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onRateChange?: (rate: number) => void;
}

const ReadingControls = ({
  isPlaying,
  duration,
  currentTime,
  onPlayPause,
  onSeek,
  onRateChange,
}: ReadingControlsProps) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  // Update slider when currentTime changes, but only if not dragging
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isDragging]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);

    // Call onSeek in real-time as the user drags
    onSeek(value);
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
    // Final seek when slider is released
    onSeek(sliderValue);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (onRateChange) {
      onRateChange(rate);
    }
  };

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="controls-container">
      <div className="controls-row">
        <button
          className="play-button"
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <div className="slider-container">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseDown={handleSliderMouseDown}
            onTouchStart={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onTouchEnd={handleSliderMouseUp}
            style={{ width: "100%" }}
            aria-label="Seek audio position"
          />
        </div>

        <div className="time-display">
          {formatTime(isDragging ? sliderValue : currentTime)} /{" "}
          {formatTime(duration)}
        </div>
      </div>

      {onRateChange && (
        <div className="playback-rate-controls">
          <span>Speed: </span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`rate-button ${playbackRate === rate ? "active" : ""}`}
              aria-pressed={playbackRate === rate}
            >
              {rate}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingControls;
