import { memo, useState } from "react";

interface HighlightableWordProps {
  id: string;
  text: string;
  originalText: string;
  isHighlighted: boolean;
  onClick?: () => void;
}

const HighlightableWord = ({
  text,
  originalText,
  isHighlighted,
  onClick,
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
      data-original-text={originalText}
    >
      {text}
    </span>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(HighlightableWord);
