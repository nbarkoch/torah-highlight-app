import { useState } from "react";
import AliyahReadingPage from "./AliyahReadingPage";
import bereshitAshkenaz from "../mocks/bereshit_a.json";
import NosachSelector from "~/components/NosachSelector/NosachSelector";
import type { AliyaData } from "~/core/models/aliyaResp";

const HomePage = () => {
  const [jsonData, setJsonData] = useState(bereshitAshkenaz);
  const [audioUrl, setAudioUrl] = useState("./bereshit/a_1.mp3");
  const [isLoading, setIsLoading] = useState(false);

  const handleNosachChange = (
    _: string,
    audioPath: string,
    jsonData: AliyaData
  ) => {
    setIsLoading(true);
    setJsonData(jsonData);
    setAudioUrl(audioPath);
    setIsLoading(false);
  };

  return (
    <div className="home-container">
      <NosachSelector onNosachChange={handleNosachChange} initialNosach="a" />

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען את נוסח הקריאה...</p>
          <p className="loading-subtitle">Loading reading tradition...</p>
        </div>
      ) : (
        <AliyahReadingPage
          jsonData={jsonData as AliyaData}
          audioUrl={audioUrl}
        />
      )}
    </div>
  );
};

export default HomePage;
