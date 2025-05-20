import { useState, useEffect } from "react";
import "./NosachSelector.css";

// Define the nosach options
const nosachOptions = [
  { id: "a", name: "אשכנז", nameEn: "Ashkenazi", letter: "א" },
  { id: "s", name: "ספרד", nameEn: "Sephardi", letter: "ס" },
  { id: "m", name: "מרוקאי", nameEn: "Moroccan", letter: "מ" },
  { id: "t", name: "תימני", nameEn: "Yemenite", letter: "ת" },
];

import bereshitAshkenaz from "~/mocks/bereshit_a.json";
import bereshitSephardi from "~/mocks/bereshit_s.json";
import bereshitMarocai from "~/mocks/bereshit_m.json";
import bereshitTemani from "~/mocks/bereshit_t.json";
import type { AliyaData } from "~/core/models/aliyaResp";

const jsonData: Record<string, AliyaData> = {
  a: bereshitAshkenaz,
  s: bereshitSephardi,
  m: bereshitMarocai,
  t: bereshitTemani,
};

interface NosachSelectorProps {
  onNosachChange: (
    nosachId: string,
    audioUrl: string,
    jsonData: AliyaData
  ) => void;
  initialNosach?: string;
}

const NosachSelector = ({
  onNosachChange,
  initialNosach = "a",
}: NosachSelectorProps) => {
  const [selectedNosach, setSelectedNosach] = useState(initialNosach);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  // Handle nosach change
  const handleNosachChange = (nosachId: string) => {
    setSelectedNosach(nosachId);

    // Show toast with tradition name
    const selectedOption = nosachOptions.find(
      (option) => option.id === nosachId
    );
    setToastMessage(`נוסח ${selectedOption?.name}`);
    setShowToast(true);

    // Hide toast after 1.5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 1500);

    // Notify parent component
    onNosachChange(
      nosachId,
      `./bereshit/${nosachId}_1.mp3`,
      jsonData[nosachId]
    );
  };

  // Initialize on first mount
  useEffect(() => {
    if (!hasMounted) {
      onNosachChange(
        selectedNosach,
        `./bereshit/${selectedNosach}_1.mp3`,
        jsonData[selectedNosach]
      );
      setHasMounted(true);
    }
  }, [selectedNosach, onNosachChange, hasMounted]);

  return (
    <>
      <div
        className="nosach-toggle-container"
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        <div className="nosach-toggle-pill" data-selected={selectedNosach}>
          <div className="nosach-toggle-spot"></div>

          {nosachOptions.map((option) => (
            <div
              key={option.id}
              className={`nosach-toggle-option ${
                selectedNosach === option.id ? "active" : ""
              }`}
              onClick={() => handleNosachChange(option.id)}
            >
              <span className="nosach-letter">{option.letter}</span>
            </div>
          ))}
        </div>

        {isTooltipVisible && (
          <div className="nosach-tooltip">
            <div className="nosach-tooltip-content">
              <div className="nosach-tooltip-title">בחר מסורת קריאה</div>
              <div className="nosach-tooltip-options">
                {nosachOptions.map((option) => (
                  <div
                    key={option.id}
                    className="nosach-tooltip-option"
                    onClick={() => handleNosachChange(option.id)}
                  >
                    <div className="nosach-tooltip-icon">{option.letter}</div>
                    <div className="nosach-tooltip-label">
                      {option.name} - {option.nameEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      <div className={`nosach-toast ${showToast ? "visible" : "hidden"}`}>
        {toastMessage}
      </div>
    </>
  );
};

export default NosachSelector;
