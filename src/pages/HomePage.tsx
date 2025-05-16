import AliyahReadingPage from "./AliyahReadingPage";

// Import JSON data
// Note: Make sure the JSON file is in the public folder or properly bundled
import bereshitData from "../mocks/bereshit1.json";

const HomePage = () => {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <AliyahReadingPage
        jsonData={bereshitData}
        audioUrl={"./bereshit/1.mp3"}
      />
    </div>
  );
};

export default HomePage;
