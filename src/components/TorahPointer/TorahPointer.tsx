import { useEffect, useState, useRef, useCallback } from "react";
import "./TorahPointer.css";

// Import PNG pointer image
import pointerImage from "../../assets/images/pointer.png";

interface TorahPointerProps {
  highlightedWordId: string | null;
  inactivityTimeout?: number; // Time in ms before pointer moves down when inactive
  isVisible?: boolean;
}

const TorahPointer = ({
  highlightedWordId,
  inactivityTimeout = 5000, // Default 5 seconds
  isVisible = false,
}: TorahPointerProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isLowered, setIsLowered] = useState(false);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const lastHighlightedWordIdRef = useRef<string | null>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  // Function to update pointer position based on the highlighted word
  const updatePointerPosition = useCallback(() => {
    // Use either current highlighted word or last known one when it becomes null
    const targetWordId = highlightedWordId || lastHighlightedWordIdRef.current;

    if (!targetWordId) return;

    // Find the word element
    const wordElement = document.querySelector(
      `.word[data-word-id="${targetWordId}"]`
    );

    if (!wordElement) {
      console.log(`Word element with ID ${targetWordId} not found`);
      return;
    }

    const rect = wordElement.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Position pointer directly under the highlighted word
    // The pointer image has the yad (pointing hand) at its bottom
    const newPosition = {
      top: rect.bottom + scrollTop + 5, // Small offset below the word
      left: rect.left + rect.width / 2, // Center the pointer horizontally with the word
    };

    setPosition(newPosition);
    lastUpdateTimeRef.current = Date.now();

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
      if (highlightedWordId || lastHighlightedWordIdRef.current) {
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
    if (highlightedWordId && isVisible) {
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
        backgroundColor: "red",
        width: "20px",
        height: "20px",
        position: "absolute",
        top: `${position.top - 20}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)", // Center the pointer horizontally
        transition: "top 0.3s ease, left 0.3s ease, transform 0.5s ease",
      }}
      aria-hidden="true"
    >
      <img src={pointerImage} alt="" className="pointer-image" />
    </div>
  );
};

export default TorahPointer;
