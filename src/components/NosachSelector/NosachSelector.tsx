import { useState, useEffect, useRef } from "react";
import "./NosachSelector.css";

// Define the nosach options
const nosachOptions = [
  { id: "a", name: "אשכנז", nameEn: "Ashkenazi" },
  { id: "s", name: "ספרד", nameEn: "Sephardi" },
  { id: "m", name: "מרוקאי", nameEn: "Moroccan" },
  { id: "t", name: "תימני", nameEn: "Yemenite" },
];

import bereshitAshkenaz from "~/mocks/bereshit_a.json";
import bereshitSephardi from "~/mocks/bereshit_s.json";
import bereshitMarocai from "~/mocks/bereshit_m.json";
import bereshitTemani from "~/mocks/bereshit_t.json";
import type { AliyaAudioData } from "~/core/models/aliyaResp";

const jsonData: Record<string, AliyaAudioData> = {
  a: bereshitAshkenaz,
  s: bereshitSephardi,
  m: bereshitMarocai,
  t: bereshitTemani,
};

interface NosachSelectorProps {
  onNosachChange: (audioUrl: string, jsonData: AliyaAudioData) => void;
  initialNosach?: string;
}

const NosachSelector = ({
  onNosachChange,
  initialNosach = "a",
}: NosachSelectorProps) => {
  const [selectedNosach, setSelectedNosach] = useState(initialNosach);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the selected nosach details
  const selectedOption = nosachOptions.find(
    (option) => option.id === selectedNosach
  );

  // Handle nosach change
  const handleNosachChange = (nosachId: string) => {
    setSelectedNosach(nosachId);
    setIsOpen(false);
    onNosachChange(`./bereshit/${nosachId}_1.mp3`, jsonData[nosachId]);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize on first mount
  useEffect(() => {
    if (!hasMounted) {
      onNosachChange(
        `./bereshit/${selectedNosach}_1.mp3`,
        jsonData[selectedNosach]
      );
      setHasMounted(true);
    }
  }, [selectedNosach, onNosachChange, hasMounted]);

  return (
    <div className="nosach-selector" ref={dropdownRef}>
      <button
        className="nosach-selector-button"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="nosach-label">נוסח</span>
        <span className="nosach-selected-name">{selectedOption?.name}</span>
        <span className="nosach-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="nosach-dropdown">
          <div className="nosach-dropdown-title">בחר מסורת קריאה</div>
          {nosachOptions.map((option) => (
            <button
              key={option.id}
              className={`nosach-option ${
                selectedNosach === option.id ? "selected" : ""
              }`}
              onClick={() => handleNosachChange(option.id)}
              aria-selected={selectedNosach === option.id}
            >
              <span className="nosach-option-name">{option.name}</span>
              <span className="nosach-option-name-en">{option.nameEn}</span>
              {selectedNosach === option.id && (
                <span className="nosach-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NosachSelector;
