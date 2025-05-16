import { useState, useEffect, useRef } from "react";

interface UseWebAudioProps {
  audioUrl: string;
}

export const useWebAudio = ({ audioUrl }: UseWebAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Properly encode the URL to handle non-ASCII characters
    const encodedUrl = encodeURI(audioUrl);
    console.log("Loading audio from:", encodedUrl);

    const audio = new Audio(encodedUrl);
    audioRef.current = audio;
    setIsLoading(true);
    setError(null);

    // Add more event listeners for debugging
    audio.addEventListener("loadstart", () => {
      console.log("Audio loading started");
    });

    audio.addEventListener("loadeddata", () => {
      console.log("Audio data loaded");
      setIsLoading(false);
    });

    audio.addEventListener("loadedmetadata", () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
      setIsLoading(false);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    });

    // Explicitly try to load the audio
    audio.load();

    return () => {
      audio.pause();
      audio.src = "";
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Play error:", err);
        setError(`Failed to play audio: ${err.message}`);
      });
      animationRef.current = requestAnimationFrame(updateTime);
    }

    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setPlaybackRate = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
  };

  return {
    isPlaying,
    duration,
    currentTime,
    isLoading,
    error,
    togglePlayPause,
    seek,
    setPlaybackRate,
  };
};
