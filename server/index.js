require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5001;

const db = require("./database");
const { authMiddleware, register, login } = require("./auth");

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const moodQuotes = {
  happy: [
    "Happiness and freedom begin with understanding: some things are within our control, some are not. — Epictetus",
    "Very little is needed to make a happy life; it is all within yourself, in your way of thinking. — Marcus Aurelius",
    "The best revenge is not to be like your enemy. — Marcus Aurelius"
  ],
  sad: [
    "You have power over your mind — not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. — Marcus Aurelius",
    "Confine yourself to the present. — Marcus Aurelius"
  ],
  anxious: [
    "Today I escaped anxiety. Or no, I discarded it, because it was within me. — Marcus Aurelius",
    "How much trouble he avoids who does not look to see what his neighbor says or does. — Marcus Aurelius",
    "Don't explain your philosophy. Embody it. — Epictetus"
  ],
  angry: [
    "How much more grievous are the consequences of anger than the causes of it. — Marcus Aurelius",
    "You will continue to suffer if you have an emotional reaction to everything that is said to you. — Anonymous",
    "The best fighter is never angry. — Lao Tzu"
  ],
  calm: [
    "If you are pained by external things, it is not they that disturb you, but your own judgment of them. — Marcus Aurelius",
    "In your actions, don't procrastinate. In your conversations, don't confuse. In your thoughts, don't wander. — Marcus Aurelius",
    "Tranquility is nothing else than the good ordering of the mind. — Marcus Aurelius"
  ],
};

// Authentication routes
app.post("/auth/register", register);
app.post("/auth/login", login);

// 🎯 Quote of the Day (with optional date parameter)
app.get("/daily", (req, res) => {
  const dailyQuotes = [
    "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
    "Waste no more time arguing what a good man should be. Be one. — Marcus Aurelius",
    "If you are pained by external things, it is not they that disturb you, but your own judgment of them. — Marcus Aurelius",
    "The best revenge is not to be like your enemy. — Marcus Aurelius",
    "Very little is needed to make a happy life; it is all within yourself. — Marcus Aurelius",
    "You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    "Don't explain your philosophy. Embody it. — Epictetus",
    "It is not what happens to you, but how you react to it that matters. — Epictetus",
    "No person was ever honored for what he received. Honor has been the reward for what he gave. — Calvin Coolidge",
    "The universe is change; our life is what our thoughts make it. — Marcus Aurelius",
    "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. — Marcus Aurelius",
    "Confine yourself to the present. — Marcus Aurelius",
    "How much trouble he avoids who does not look to see what his neighbor says or does. — Marcus Aurelius",
    "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness. — Marcus Aurelius",
    "Every new beginning comes from some other beginning's end. — Seneca",
    "Today I escaped anxiety. Or no, I discarded it, because it was within me. — Marcus Aurelius",
    "The mind that is not baffled is not employed. — Wendell Berry",
    "Accept the things to which fate binds you, and love the people with whom fate associates you. — Marcus Aurelius",
    "You are an actor in a play, which is as the author wants it to be. — Epictetus",
    "When we are no longer able to change a situation, we are challenged to change ourselves. — Viktor Frankl",
    "At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work—as a human being.' — Marcus Aurelius",
    "Be like the rocky headland on which the waves constantly break. It stands firm, and round it the seething waters are laid to rest. — Marcus Aurelius",
    "When you lie down, you will not be afraid; when you lie down, your sleep will be sweet. — Proverbs 3:24",
    "Let all your things have their places; let each part of your business have its time. — Benjamin Franklin",
    "Peace comes from within. Do not seek it without. — Buddha",
    "What we do now echoes in eternity. — Marcus Aurelius",
    "The mind that is anxious about future misfortunes is miserable. — Seneca",
    "It never ceases to amaze me: we all love ourselves more than other people, but care more about their opinion than our own. — Marcus Aurelius",
    "How much more grievous are the consequences of anger than the causes of it. — Marcus Aurelius",
    "You will continue to suffer if you have an emotional reaction to everything that is said to you. — Anonymous",
    "The best fighter is never angry. — Lao Tzu",
    "In your actions, don't procrastinate. In your conversations, don't confuse. In your thoughts, don't wander. — Marcus Aurelius",
    "Tranquility is nothing else than the good ordering of the mind. — Marcus Aurelius",
    "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth. — Marcus Aurelius",
    "The soul becomes dyed with the color of its thoughts. — Marcus Aurelius",
    "Remember that very little is needed to make a happy life; it is all within yourself, in your way of thinking. — Marcus Aurelius",
    "The first rule is to keep an untroubled spirit. The second is to look things in the face and know them for what they are. — Marcus Aurelius",
    "Adapt yourself to the life you've been given, but love the people with whom you share it. — Marcus Aurelius",
    "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love. — Marcus Aurelius",
    "Dwell on the beauty of life. Watch the stars, and see yourself running with them. — Marcus Aurelius",
    "The best revenge is not to be like your enemy. — Marcus Aurelius",
    "You can commit injustice by doing nothing. — Marcus Aurelius",
    "Loss is nothing else but change, and change is Nature's delight. — Marcus Aurelius",
    "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present. — Marcus Aurelius",
    "If you seek tranquility, do less. Or more accurately, do what's essential. — Marcus Aurelius",
    "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
    "We suffer more often in imagination than in reality. — Seneca",
    "It is likely that some troubles will befall us; but it is not a present fact. How often has the unexpected happened! How often has the expected never come to pass! — Seneca",
    "True happiness is to enjoy the present, without anxious dependence upon the future. — Seneca",
    "Nothing, to my way of thinking, is a better proof of a well-ordered mind than a man's ability to stop just where he is and pass some time in his own company. — Seneca",
    "It is more fitting for a man to laugh at life than to lament over it. — Seneca",
    "The willing, destiny guides them. The unwilling, destiny drags them. — Cleanthes",
    "Man is disturbed not by things, but by the views he takes of things. — Epictetus",
    "Wealth consists in not having great possessions, but in having few wants. — Epictetus",
    "First say to yourself what kind of person you want to be, then do what you have to do. — Epictetus",
    "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has. — Epictetus",
    "No great thing is created suddenly. — Epictetus",
    "Only the educated are free. — Epictetus",
    "When we are no longer able to change a situation, we are challenged to change ourselves. — Viktor Frankl",
    "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. — Viktor Frankl"
  ];
  
  // Use year + day of year to ensure daily uniqueness across years
  // Allow date parameter for historical quotes
  const dateParam = req.query.date;
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  
  const start = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const seed = targetDate.getFullYear() * 1000 + dayOfYear;
  
  const quote = dailyQuotes[seed % dailyQuotes.length];
  
  res.json({ quote });
});

// 🎯 Mood-based quote
app.post("/quote", (req, res) => {
  const mood = req.body.mood?.toLowerCase();
  const quotes = moodQuotes[mood];

  if (!quotes) {
    return res.status(404).json({
      quote: "No quote found for that mood, but remember: all is opinion. — Marcus Aurelius",
    });
  }

  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
});

// Journal entries
app.get("/journal", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/journal", authMiddleware, async (req, res) => {
  const { content } = req.body;
  console.log('Journal POST request:', { userId: req.userId, content });
  try {
    const result = await db.query(
      "INSERT INTO journal_entries (user_id, content) VALUES ($1, $2) RETURNING id",
      [req.userId, content]
    );
    console.log('Journal entry created:', result.rows[0]);
    res.json({ id: result.rows[0].id, message: "Journal entry created" });
  } catch (err) {
    console.error('Journal POST error:', err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.put("/journal/:id", authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    await db.query(
      "UPDATE journal_entries SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3",
      [content, req.params.id, req.userId]
    );
    res.json({ message: "Journal entry updated" });
  } catch (err) {
    console.error('Journal PUT error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/journal/:id", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Journal entry deleted" });
  } catch (err) {
    console.error('Journal DELETE error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// Ideas
app.get("/ideas", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM ideas WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/ideas", authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO ideas (user_id, title, content, category) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.userId, title, content, category || 'general']
    );
    res.json({ id: result.rows[0].id, message: "Idea saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/ideas/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM ideas WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Idea not found" });
    }
    
    res.json({ message: "Idea deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Reminders
app.get("/reminders", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM reminders WHERE user_id = $1 ORDER BY reminder_date ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/reminders", authMiddleware, async (req, res) => {
  const { title, description, reminder_date } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO reminders (user_id, title, description, reminder_date) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.userId, title, description, reminder_date]
    );
    res.json({ id: result.rows[0].id, message: "Reminder created" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/reminders/:id", authMiddleware, async (req, res) => {
  const { completed } = req.body;
  try {
    await db.query(
      "UPDATE reminders SET completed = $1 WHERE id = $2 AND user_id = $3",
      [completed, req.params.id, req.userId]
    );
    res.json({ message: "Reminder updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Events/Schedule
app.get("/events", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM events WHERE user_id = $1 ORDER BY start_time ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/events", authMiddleware, async (req, res) => {
  const { title, description, start_time, end_time, event_type } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO events (user_id, title, description, start_time, end_time, event_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [req.userId, title, description, start_time, end_time, event_type || 'meeting']
    );
    res.json({ id: result.rows[0].id, message: "Event created" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/events/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM events WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mood tracking - with optional date filter
app.get("/mood-entries", authMiddleware, async (req, res) => {
  try {
    const date = req.query.date;
    let query, params;
    
    if (date) {
      query = "SELECT * FROM mood_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at ASC";
      params = [req.userId, date];
    } else {
      query = "SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC";
      params = [req.userId];
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/mood", authMiddleware, async (req, res) => {
  const { mood, energy_level, notes, entry_type, entry_date, one_word_feeling } = req.body;
  const quotes = moodQuotes[mood.toLowerCase()];
  const stoic_quote = quotes ? quotes[Math.floor(Math.random() * quotes.length)] : null;
  
  try {
    const result = await db.query(
      "INSERT INTO mood_entries (user_id, mood, energy_level, notes, stoic_quote, entry_type, entry_date, one_word_feeling) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [req.userId, mood, energy_level, notes, stoic_quote, entry_type || 'general', entry_date || new Date().toISOString().split('T')[0], one_word_feeling]
    );
    res.json({ id: result.rows[0].id, quote: stoic_quote, message: "Mood logged" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Poetry
app.get("/poetry", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM poetry WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/poetry", authMiddleware, async (req, res) => {
  const { title, content, language } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO poetry (user_id, title, content, language) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.userId, title, content, language || 'en']
    );
    res.json({ id: result.rows[0].id, message: "Poem saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Poetry ideas
app.get("/poetry-ideas", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM poetry_ideas WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/poetry-ideas", authMiddleware, async (req, res) => {
  const { idea, inspiration } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO poetry_ideas (user_id, idea, inspiration) VALUES ($1, $2, $3) RETURNING id",
      [req.userId, idea, inspiration || '']
    );
    res.json({ id: result.rows[0].id, message: "Poetry idea saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Workouts
app.get("/workouts", authMiddleware, async (req, res) => {
  try {
    const workoutsResult = await db.query(
      "SELECT * FROM workouts WHERE user_id = $1 ORDER BY target_date DESC",
      [req.userId]
    );
    
    // Get exercises for each workout
    const workoutPromises = workoutsResult.rows.map(async workout => {
      try {
        const exercisesResult = await db.query(
          "SELECT * FROM workout_exercises WHERE workout_id = $1 ORDER BY order_index",
          [workout.id]
        );
        return {
          ...workout,
          exercises: exercisesResult.rows
        };
      } catch (err) {
        return {
          ...workout,
          exercises: []
        };
      }
    });
    
    const workoutsWithExercises = await Promise.all(workoutPromises);
    res.json(workoutsWithExercises);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/workouts", authMiddleware, async (req, res) => {
  const { name, description, target_date, target_time, recurring_type, recurring_days, reminder_enabled, reminder_minutes, exercises } = req.body;
  
  try {
    const workoutResult = await db.query(
      "INSERT INTO workouts (user_id, name, description, target_date, target_time, recurring_type, recurring_days, reminder_enabled, reminder_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      [req.userId, name, description, target_date, target_time, recurring_type || 'none', recurring_days || '', reminder_enabled !== false, reminder_minutes || 15]
    );
    
    const workoutId = workoutResult.rows[0].id;
    
    // Insert exercises if provided
    if (exercises && exercises.length > 0) {
      try {
        const exercisePromises = exercises.map((exercise, index) => {
          return db.query(
            "INSERT INTO workout_exercises (workout_id, exercise_name, sets, reps, weight, duration, distance, notes, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [workoutId, exercise.exercise_name, exercise.sets, exercise.reps, exercise.weight, exercise.duration, exercise.distance, exercise.notes, index]
          );
        });
        
        await Promise.all(exercisePromises);
        res.json({ id: workoutId, message: "Workout created with exercises" });
      } catch (exerciseError) {
        res.status(500).json({ error: "Error adding exercises" });
      }
    } else {
      res.json({ id: workoutId, message: "Workout created" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/workouts/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM workouts WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }
    
    res.json({ message: "Workout deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/workouts/:id/complete", authMiddleware, async (req, res) => {
  const { duration, calories_burned, notes } = req.body;
  try {
    await db.query(
      "UPDATE workouts SET completed = TRUE, completion_date = CURRENT_TIMESTAMP, duration = $1, calories_burned = $2, notes = $3 WHERE id = $4 AND user_id = $5",
      [duration, calories_burned, notes, req.params.id, req.userId]
    );
    res.json({ message: "Workout completed" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Meals
app.get("/meals", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM meals WHERE user_id = $1 ORDER BY meal_time DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/meals", authMiddleware, upload.single('photo'), async (req, res) => {
  const { meal_name, description, calories, meal_time } = req.body;
  const photo_path = req.file ? req.file.filename : null;
  
  try {
    const result = await db.query(
      "INSERT INTO meals (user_id, meal_name, description, calories, photo_path, meal_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [req.userId, meal_name, description, calories, photo_path, meal_time || new Date().toISOString()]
    );
    res.json({ id: result.rows[0].id, message: "Meal logged" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/meals/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM meals WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }
    
    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Notes
app.get("/notes", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/notes", authMiddleware, async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO notes (user_id, title, content, category, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [req.userId, title, content, category || 'general', tags || '']
    );
    res.json({ id: result.rows[0].id, message: "Note saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Daily goals
app.get("/goals/:date", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM daily_goals WHERE user_id = $1 AND goal_date = $2",
      [req.userId, req.params.date]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Weekly/Monthly aggregated goals
app.get("/goals/range/:startDate/:endDate", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const result = await db.query(
      `SELECT 
        AVG(daily_steps) as avg_daily_steps,
        AVG(calorie_goal) as avg_calorie_goal,
        COUNT(*) as days_tracked
      FROM daily_goals 
      WHERE user_id = $1 AND goal_date >= $2 AND goal_date <= $3`,
      [req.userId, startDate, endDate]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Range goals error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/goals", authMiddleware, async (req, res) => {
  const { goal_date, calorie_goal, water_goal, exercise_goal } = req.body;
  try {
    await db.query(
      "INSERT INTO daily_goals (user_id, goal_date, calorie_goal, water_goal, exercise_goal, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) ON CONFLICT (user_id, goal_date) DO UPDATE SET calorie_goal = EXCLUDED.calorie_goal, water_goal = EXCLUDED.water_goal, exercise_goal = EXCLUDED.exercise_goal, updated_at = CURRENT_TIMESTAMP",
      [req.userId, goal_date, calorie_goal, water_goal, exercise_goal]
    );
    res.json({ message: "Goals updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Debug: Get all todos
app.get("/todos/all", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT *, date::date as date_only FROM daily_todos WHERE user_id = $1 ORDER BY created_at ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Daily todos
app.get("/todos/daily", authMiddleware, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const result = await db.query(
      "SELECT * FROM daily_todos WHERE user_id = $1 AND date::date = $2::date ORDER BY created_at ASC",
      [req.userId, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/todos", authMiddleware, async (req, res) => {
  const { text, date, category } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO daily_todos (user_id, text, date, category) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.userId, text, date || new Date().toISOString().split('T')[0], category || 'work']
    );
    res.json({ id: result.rows[0].id, text, category: category || 'work', completed: false, message: "Todo created" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/todos/:id/toggle", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "UPDATE daily_todos SET completed = NOT completed WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Todo toggled" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/todos/:id", authMiddleware, async (req, res) => {
  const { text, category } = req.body;
  try {
    await db.query(
      "UPDATE daily_todos SET text = $1, category = $2 WHERE id = $3 AND user_id = $4",
      [text, category, req.params.id, req.userId]
    );
    res.json({ message: "Todo updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/todos/:id", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM daily_todos WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Books endpoints
app.get("/books", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/books", authMiddleware, upload.single('cover'), async (req, res) => {
  const { title, author, genre, description, status, rating } = req.body;
  const cover_image = req.file ? req.file.filename : null;
  
  try {
    const result = await db.query(
      "INSERT INTO books (user_id, title, author, genre, description, cover_image, status, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [req.userId, title, author, genre || null, description || null, cover_image, status || 'want-to-read', parseInt(rating) || 0]
    );
    res.json({ id: result.rows[0].id, message: "Book added successfully" });
  } catch (err) {
    console.error('Book creation error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/books/:id/notes", authMiddleware, async (req, res) => {
  try {
    // First get the book details
    const bookResult = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    // Then get all notes for this book
    const notesResult = await db.query(
      "SELECT * FROM book_notes WHERE book_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );
    
    const book = bookResult.rows[0];
    book.notes = notesResult.rows;
    
    res.json(book);
  } catch (err) {
    console.error('Book notes fetch error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/book-notes", authMiddleware, upload.single('image'), async (req, res) => {
  const { content, bookId } = req.body;
  const image_path = req.file ? req.file.filename : null;
  
  try {
    // Verify the book belongs to the user
    const bookCheck = await db.query(
      "SELECT id FROM books WHERE id = $1 AND user_id = $2",
      [bookId, req.userId]
    );
    
    if (bookCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const result = await db.query(
      "INSERT INTO book_notes (book_id, content, image_path) VALUES ($1, $2, $3) RETURNING id",
      [bookId, content, image_path]
    );
    
    res.json({ id: result.rows[0].id, message: "Note added successfully" });
  } catch (err) {
    console.error('Book note creation error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/books/:id", authMiddleware, upload.single('cover'), async (req, res) => {
  const { title, author, genre, description, status, rating } = req.body;
  const cover_image = req.file ? req.file.filename : undefined;
  
  try {
    let query = "UPDATE books SET title = $1, author = $2, genre = $3, description = $4, status = $5, rating = $6, updated_at = CURRENT_TIMESTAMP";
    let values = [title, author, genre || null, description || null, status, parseInt(rating) || 0];
    
    if (cover_image) {
      query += ", cover_image = $7";
      values.push(cover_image);
    }
    
    query += " WHERE id = $" + (values.length + 1) + " AND user_id = $" + (values.length + 2);
    values.push(req.params.id, req.userId);
    
    await db.query(query, values);
    res.json({ message: "Book updated successfully" });
  } catch (err) {
    console.error('Book update error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/book-notes/:id", authMiddleware, async (req, res) => {
  try {
    // Verify the note belongs to a book owned by the user
    const noteCheck = await db.query(
      "SELECT bn.id FROM book_notes bn JOIN books b ON bn.book_id = b.id WHERE bn.id = $1 AND b.user_id = $2",
      [req.params.id, req.userId]
    );
    
    if (noteCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await db.query("DELETE FROM book_notes WHERE id = $1", [req.params.id]);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error('Book note deletion error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// Daily tracking
app.post("/daily-tracking", authMiddleware, async (req, res) => {
  const { 
    daily_steps, 
    calories_in, 
    calories_out,
    water_oz, 
    recovery_score,
    strain_score,
    sleep_hours,
    sleep_efficiency,
    hrv_score,
    resting_hr,
    date 
  } = req.body;
  
  try {
    await db.query(
      `INSERT INTO daily_goals (
        user_id, goal_date, daily_steps, calorie_goal, calories_out, water_oz, 
        recovery_score, strain_score, sleep_hours, sleep_efficiency, hrv_score, resting_hr,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) 
      ON CONFLICT (user_id, goal_date) DO UPDATE SET 
        daily_steps = EXCLUDED.daily_steps, 
        calorie_goal = EXCLUDED.calorie_goal,
        calories_out = EXCLUDED.calories_out,
        water_oz = EXCLUDED.water_oz,
        recovery_score = EXCLUDED.recovery_score,
        strain_score = EXCLUDED.strain_score,
        sleep_hours = EXCLUDED.sleep_hours,
        sleep_efficiency = EXCLUDED.sleep_efficiency,
        hrv_score = EXCLUDED.hrv_score,
        resting_hr = EXCLUDED.resting_hr,
        updated_at = CURRENT_TIMESTAMP`,
      [req.userId, date, daily_steps, calories_in, calories_out, water_oz, recovery_score, strain_score, sleep_hours, sleep_efficiency, hrv_score, resting_hr]
    );
    res.json({ message: "Daily tracking updated" });
  } catch (err) {
    console.error('Daily tracking error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Personal Development Journal API running at http://localhost:${PORT}`);
});
