import { useState } from "react";

const presetMoods = ["Happy", "Sad", "Anxious", "Calm", "Angry"];

const MoodSelector = () => {
  const [quote, setQuote] = useState("");

  const getQuote = async (selectedMood: string) => {
    try {
      const res = await fetch("http://localhost:5000/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood }),
      });

      const data = await res.json();
      setQuote(data.quote);
    } catch (err) {
      setQuote("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="text-center">
      <h5 className="mb-3">How are you feeling today?</h5>

      {/* ✅ Mobile-friendly buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
        {presetMoods.map((m) => (
          <button
            key={m}
            className="btn btn-outline-secondary"
            onClick={() => getQuote(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {/* ✅ Responsive input box */}
      <input
        type="text"
        className="form-control w-100 w-sm-75 w-md-50 mx-auto mb-3"
        placeholder="Or type your mood..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const inputValue = (e.target as HTMLInputElement).value;
            getQuote(inputValue);
          }
        }}
      />

      {/* ✅ Quote result */}
      {quote && (
        <div className="alert alert-info mt-4 w-100 w-md-75 mx-auto">
          {quote}
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
