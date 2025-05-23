import AliyahReadingPage from "./AliyahReadingPage";
import aliya from "../mocks/bereshit_1.json";
import type { AliyaData } from "~/core/models/aliyaResp";

const HomePage = () => {
  return (
    <div className="home-container">
      <AliyahReadingPage jsonData={aliya as AliyaData} />
    </div>
  );
};

export default HomePage;
