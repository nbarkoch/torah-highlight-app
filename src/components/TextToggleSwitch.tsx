import { useState, useEffect, useCallback } from "react";
import "../styles/TextToggleSwitch.css";
interface TextToggleSwitchProps {
  onChange: (showPlain: boolean) => void;
  isPlainText: boolean;
}

const TextToggleSwitch = ({ onChange, isPlainText }: TextToggleSwitchProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const toggleMode = useCallback(() => {
    onChange(!isPlainText);
  }, [isPlainText, onChange]);

  // Handle keyboard shortcut for switching modes
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        // Only activate if not in an input field
        if (
          e.target instanceof HTMLElement &&
          e.target.tagName !== "INPUT" &&
          e.target.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          toggleMode();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlainText, toggleMode]);

  // Show toast message when mode changes
  useEffect(() => {
    if (isPlainText) {
      setToastMessage("מצב טקסט ללא ניקוד וטעמים");
    } else {
      setToastMessage("מצב טקסט עם ניקוד וטעמים");
    }

    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlainText]);

  return (
    <>
      <div
        className="text-toggle-switch-container"
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        <div
          className={`text-toggle-pill ${isPlainText ? "right" : "left"}`}
          onClick={toggleMode}
        >
          <div className="toggle-spot"></div>
          <div className="toggle-option decorated">
            <span className="letter">{"אָּ֙"}</span>
          </div>
          <div className="toggle-option plain">
            <span className="letter">{"א"}</span>
          </div>
        </div>

        {isTooltipVisible && (
          <div className="toggle-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-title">החלף מצב תצוגת טקסט</div>
              <div className="tooltip-shortcut">
                מקש רווח: החלפה מהירה בין המצבים
              </div>
              <div className="tooltip-modes">
                <div className="tooltip-mode">
                  <span className="mode-icon decorated">{"אָּ֙"}</span>
                  <span className="mode-label">עם ניקוד וטעמים</span>
                </div>
                <div className="tooltip-mode">
                  <span className="mode-icon plain">{"א"}</span>
                  <span className="mode-label">ללא ניקוד וטעמים</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`mode-toast ${showToast ? "visible" : "hidden"}`}>
        {toastMessage}
      </div>
    </>
  );
};

export default TextToggleSwitch;
