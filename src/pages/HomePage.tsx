import AliyahReadingPage from "~/pages/AliyahReadingPage";

// Import JSON data
// Note: Make sure the JSON file is in the public folder or properly bundled
import bereshitData from "../mocks/bereshit_a.json";

const HomePage = () => {
  return (
    <AliyahReadingPage
      jsonData={bereshitData}
      audioUrl={"./bereshit/a_1.mp3"}
    />
  );
};

export default HomePage;
