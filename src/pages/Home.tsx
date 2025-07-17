import MoodSelector from "../components/MoodSelector";
import { useEffect, useState } from "react";

const Home = () => {
  const [dailyQuote, setDailyQuote] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/daily")
      .then((res) => res.json())
      .then((data) => setDailyQuote(data.quote));
  }, []);

  return (
    <div className="split-screen-container">
      {/* Left = Daily Quote */}
      <div className="left-pane d-flex flex-column justify-content-center align-items-center text-center px-4">
        <h1 className="display-5 mb-4">🧘 Stoic Wisdom</h1>
        <blockquote className="blockquote">
          <p className="mb-3">{dailyQuote || "Loading quote..."}</p>
          <footer className="blockquote-footer">Marcus Aurelius</footer>
        </blockquote>
      </div>

      {/* Right = Mood Input */}
      <div className="right-pane d-flex flex-column justify-content-center align-items-center text-center px-4">
        <MoodSelector />
      </div>
    </div>
  );
};

export default Home;
