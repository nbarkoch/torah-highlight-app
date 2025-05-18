import { useState } from "react";

interface TextToggleSwitchProps {
  onChange: (showPlain: boolean) => void;
  isPlainText: boolean;
}

const TextToggleSwitch = ({ onChange, isPlainText }: TextToggleSwitchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      onChange(!isPlainText);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(!isPlainText);
  };

  const handleToggleClick = () => {
    onChange(!isPlainText);
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  return (
    <div
      className="floating-toggle"
      onContextMenu={handleContextMenu}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="החלף בין טקסט עם וללא ניקוד/טעמים (לחץ על רווח או כפתור ימני) | Toggle between text with and without nikkud/taamim (press space or right-click)"
    >
      <button
        className={`floating-toggle-button ${isPlainText ? "active" : ""}`}
        onClick={handleToggleClick}
        aria-pressed={isPlainText}
      >
        <span className="toggle-icon">א</span>
        <span
          className={`toggle-indicator ${isPlainText ? "plain" : "decorated"}`}
        >
          {isPlainText ? "א" : "אָ"}
        </span>
      </button>

      {isExpanded && (
        <div className="floating-toggle-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-header">
              <span>
                {isPlainText ? "ללא ניקוד וטעמים" : "עִם נִיקּוּד וְטַעֲמִים"}
              </span>
              <span className="tooltip-header-en">
                {isPlainText ? "Without Nikkud/Taamim" : "With Nikkud/Taamim"}
              </span>
            </div>
            <div className="tooltip-hint">
              <span>לחץ ימני או מקש רווח להחלפה</span>
              <span className="tooltip-hint-en">
                Right-click or Space to toggle
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToggleSwitch;
