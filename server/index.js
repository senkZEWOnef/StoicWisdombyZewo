const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const moodQuotes = {
  happy: [
    "Happiness and freedom begin with understanding: some things are within our control, some are not. — Epictetus",
  ],
  sad: [
    "You have power over your mind — not outside events. Realize this, and you will find strength. — Marcus Aurelius",
  ],
  anxious: [
    "Today I escaped anxiety. Or no, I discarded it, because it was within me. — Marcus Aurelius",
  ],
  angry: [
    "How much more grievous are the consequences of anger than the causes of it. — Marcus Aurelius",
  ],
  calm: [
    "If you are pained by external things, it is not they that disturb you, but your own judgment of them. — Marcus Aurelius",
  ],
};

// 🎯 Quote of the Day
app.get("/daily", (req, res) => {
  res.json({
    quote:
      "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
  });
});

// 🎯 Mood-based quote
app.post("/quote", (req, res) => {
  const mood = req.body.mood?.toLowerCase();
  const quotes = moodQuotes[mood];

  if (!quotes) {
    return res.status(404).json({
      quote:
        "No quote found for that mood, but remember: all is opinion. — Marcus Aurelius",
    });
  }

  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
});

app.listen(PORT, () => {
  console.log(`✅ Stoic Wisdom API running at http://localhost:${PORT}`);
});
