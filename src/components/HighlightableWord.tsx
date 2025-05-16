import { memo } from "react";

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
  return (
    <span
      className={`word ${isHighlighted ? "highlighted" : ""}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(HighlightableWord);
