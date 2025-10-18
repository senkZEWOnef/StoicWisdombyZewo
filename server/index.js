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

// 🎯 Quote of the Day
app.get("/daily", (req, res) => {
  const dailyQuotes = [
    "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
    "Waste no more time arguing what a good man should be. Be one. — Marcus Aurelius",
    "If you are pained by external things, it is not they that disturb you, but your own judgment of them. — Marcus Aurelius",
    "The best revenge is not to be like your enemy. — Marcus Aurelius",
    "Very little is needed to make a happy life; it is all within yourself. — Marcus Aurelius"
  ];
  
  const today = new Date().getDate();
  const quote = dailyQuotes[today % dailyQuotes.length];
  
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

// Mood tracking
app.get("/mood-entries", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/mood", authMiddleware, async (req, res) => {
  const { mood, energy_level, notes } = req.body;
  const quotes = moodQuotes[mood.toLowerCase()];
  const stoic_quote = quotes ? quotes[Math.floor(Math.random() * quotes.length)] : null;
  
  try {
    const result = await db.query(
      "INSERT INTO mood_entries (user_id, mood, energy_level, notes, stoic_quote) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [req.userId, mood, energy_level, notes, stoic_quote]
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

// Daily todos
app.get("/todos/daily", authMiddleware, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const result = await db.query(
      "SELECT * FROM daily_todos WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC",
      [req.userId, today]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/todos", authMiddleware, async (req, res) => {
  const { text, date } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO daily_todos (user_id, text, date) VALUES ($1, $2, $3) RETURNING id",
      [req.userId, text, date || new Date().toISOString().split('T')[0]]
    );
    res.json({ id: result.rows[0].id, text, completed: false, message: "Todo created" });
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

// Daily tracking
app.post("/daily-tracking", authMiddleware, async (req, res) => {
  const { daily_steps, calories_consumed, date } = req.body;
  try {
    await db.query(
      "INSERT INTO daily_goals (user_id, goal_date, daily_steps, calorie_goal, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (user_id, goal_date) DO UPDATE SET daily_steps = EXCLUDED.daily_steps, calorie_goal = EXCLUDED.calorie_goal, updated_at = CURRENT_TIMESTAMP",
      [req.userId, date, daily_steps, calories_consumed]
    );
    res.json({ message: "Daily tracking updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Personal Development Journal API running at http://localhost:${PORT}`);
});
