import AliyahReadingPage from "~/AliyahReadingPage";

// Import JSON data
// Note: Make sure the JSON file is in the public folder or properly bundled
import bereshitData from "../mocks/bereshit1.json";

const HomePage = () => {
  return (
    <AliyahReadingPage jsonData={bereshitData} audioUrl={"./bereshit/1.mp3"} />
  );
};

export default HomePage;
