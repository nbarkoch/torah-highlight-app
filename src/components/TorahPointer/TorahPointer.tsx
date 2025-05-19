import { useEffect, useState, useRef, useCallback } from "react";
import "./TorahPointer.css";

interface TorahPointerProps {
  highlightedWordId: string | null;
  inactivityTimeout?: number; // Time in ms before pointer moves down when inactive
}

const TorahPointer = ({
  highlightedWordId,
  inactivityTimeout = 5000, // Default 5 seconds
}: TorahPointerProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isLowered, setIsLowered] = useState(false);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const lastPositionRef = useRef({ top: 0, left: 0 });
  const pointerRef = useRef<HTMLDivElement>(null);
  const lastHighlightedWordIdRef = useRef<string | null>(null);

  // Function to update pointer position based on the highlighted word
  const updatePointerPosition = useCallback(() => {
    // Use either current highlighted word or last known one when it becomes null
    const targetWordId = highlightedWordId || lastHighlightedWordIdRef.current;

    if (!targetWordId) return;

    // Find the word element
    const wordElement =
      document.querySelector(`.word[id="${targetWordId}"]`) ||
      document.querySelector(`.word[data-word-id="${targetWordId}"]`);

    if (!wordElement) {
      // Try alternative selector that matches your DOM structure
      const alternativeElement =
        document.querySelector(`[id="${targetWordId}"]`) ||
        document.querySelector(`[data-id="${targetWordId}"]`);

      if (!alternativeElement) {
        console.log(`Word element with ID ${targetWordId} not found`);
        return;
      }

      const rect = alternativeElement.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      // Position at the bottom right corner of the word
      const newPosition = {
        top: rect.bottom + scrollTop,
        left: rect.right + scrollLeft - 5, // Small offset for better positioning
      };

      setPosition(newPosition);
      lastPositionRef.current = newPosition;
      lastUpdateTimeRef.current = Date.now();
      setIsVisible(true);
      setIsLowered(false);
      return;
    }

    const rect = wordElement.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Position at the bottom right corner of the word
    const newPosition = {
      top: rect.bottom + scrollTop,
      left: rect.right + scrollLeft - 5, // Small offset for better positioning
    };

    setPosition(newPosition);
    lastPositionRef.current = newPosition;
    lastUpdateTimeRef.current = Date.now();
    setIsVisible(true);
    setIsLowered(false);
  }, [highlightedWordId]);

  // Effect to update position when highlighted word changes
  useEffect(() => {
    if (highlightedWordId) {
      // Save the last valid word ID for when it becomes null
      lastHighlightedWordIdRef.current = highlightedWordId;

      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        updatePointerPosition();
      }, 50);
    }
  }, [highlightedWordId, updatePointerPosition]);

  // Effect to check for inactivity and lower the pointer
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > inactivityTimeout && !isLowered) {
        setIsLowered(true);
      }
    };

    const intervalId = setInterval(checkInactivity, 1000);
    return () => clearInterval(intervalId);
  }, [inactivityTimeout, isLowered]);

  // Adjust position when window scrolls or resizes
  useEffect(() => {
    const handleViewportChange = () => {
      if (highlightedWordId) {
        updatePointerPosition();
      }
    };

    window.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [highlightedWordId, updatePointerPosition]);

  // Ensure pointer is visible after first active word
  useEffect(() => {
    if (highlightedWordId && !isVisible) {
      setIsVisible(true);
      updatePointerPosition();
    }
  }, [highlightedWordId, isVisible, updatePointerPosition]);

  if (!isVisible || (!highlightedWordId && !lastHighlightedWordIdRef.current)) {
    return null;
  }

  return (
    <div
      ref={pointerRef}
      className={`torah-pointer ${isLowered ? "lowered" : ""}`}
      style={{
        position: "absolute",
        top: `${position.top - 50}px`,
        left: `${position.left - 200}px`,
        transition: "top 0.3s ease, left 0.3s ease, transform 0.3s ease",
      }}
      aria-hidden="true" // This is decorative, not functional for screen readers
    >
      <div className="pointer-handle"></div>
      <div className="pointer-head"></div>
    </div>
  );
};

export default TorahPointer;
