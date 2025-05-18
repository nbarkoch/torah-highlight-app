import { memo, useState } from "react";

interface HighlightableWordProps {
  id: string;
  text: string;
  isHighlighted: boolean;
  onClick?: () => void;
}

const HighlightableWord = ({
  text,
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
      data-text={text} // For potential tooltip or accessibility features
    >
      {text}
    </span>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(HighlightableWord);
