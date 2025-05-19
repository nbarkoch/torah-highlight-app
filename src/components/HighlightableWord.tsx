import { memo, useState } from "react";
import { removeNikkudAndTaamim } from "../utils/forRead";

interface HighlightableWordProps {
  id: string;
  text: string;
  isHighlighted: boolean;
  onClick?: () => void;
  showPlainText: boolean;
}

const HighlightableWord = ({
  text,
  showPlainText,
  isHighlighted,
  onClick,
  id,
}: HighlightableWordProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`word ${isHighlighted ? "highlighted" : ""} ${
        isHovered ? "hovered" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-text={text}
      data-original-text={text}
      data-word-id={id}
    >
      <span style={{ position: "relative" }}>
        <span style={{ opacity: 0 }}>{text}</span>
        <span style={{ position: "absolute", left: 0 }}>
          {showPlainText ? removeNikkudAndTaamim(text) : text}
        </span>
      </span>
    </span>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(HighlightableWord);
