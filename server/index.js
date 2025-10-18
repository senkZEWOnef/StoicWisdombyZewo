const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5001;

const db = require("./database");
const { authMiddleware, register, login } = require("./auth");

app.use(cors());
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
app.get("/journal", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/journal", authMiddleware, (req, res) => {
  const { content } = req.body;
  db.run(
    "INSERT INTO journal_entries (user_id, content) VALUES (?, ?)",
    [req.userId, content],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Journal entry created" });
    }
  );
});

// Ideas
app.get("/ideas", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/ideas", authMiddleware, (req, res) => {
  const { title, content, category } = req.body;
  db.run(
    "INSERT INTO ideas (user_id, title, content, category) VALUES (?, ?, ?, ?)",
    [req.userId, title, content, category || 'general'],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Idea saved" });
    }
  );
});

// Reminders
app.get("/reminders", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_date ASC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/reminders", authMiddleware, (req, res) => {
  const { title, description, reminder_date } = req.body;
  db.run(
    "INSERT INTO reminders (user_id, title, description, reminder_date) VALUES (?, ?, ?, ?)",
    [req.userId, title, description, reminder_date],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Reminder created" });
    }
  );
});

app.put("/reminders/:id", authMiddleware, (req, res) => {
  const { completed } = req.body;
  db.run(
    "UPDATE reminders SET completed = ? WHERE id = ? AND user_id = ?",
    [completed, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Reminder updated" });
    }
  );
});

// Events/Schedule
app.get("/events", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM events WHERE user_id = ? ORDER BY start_time ASC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/events", authMiddleware, (req, res) => {
  const { title, description, start_time, end_time, event_type } = req.body;
  db.run(
    "INSERT INTO events (user_id, title, description, start_time, end_time, event_type) VALUES (?, ?, ?, ?, ?, ?)",
    [req.userId, title, description, start_time, end_time, event_type || 'meeting'],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Event created" });
    }
  );
});

// Mood tracking
app.get("/mood-entries", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/mood", authMiddleware, (req, res) => {
  const { mood, energy_level, notes } = req.body;
  const quotes = moodQuotes[mood.toLowerCase()];
  const stoic_quote = quotes ? quotes[Math.floor(Math.random() * quotes.length)] : null;
  
  db.run(
    "INSERT INTO mood_entries (user_id, mood, energy_level, notes, stoic_quote) VALUES (?, ?, ?, ?, ?)",
    [req.userId, mood, energy_level, notes, stoic_quote],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, quote: stoic_quote, message: "Mood logged" });
    }
  );
});

// Poetry
app.get("/poetry", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM poetry WHERE user_id = ? ORDER BY created_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/poetry", authMiddleware, (req, res) => {
  const { title, content, language } = req.body;
  db.run(
    "INSERT INTO poetry (user_id, title, content, language) VALUES (?, ?, ?, ?)",
    [req.userId, title, content, language || 'en'],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Poem saved" });
    }
  );
});

// Poetry ideas
app.get("/poetry-ideas", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM poetry_ideas WHERE user_id = ? ORDER BY created_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/poetry-ideas", authMiddleware, (req, res) => {
  const { idea, inspiration } = req.body;
  db.run(
    "INSERT INTO poetry_ideas (user_id, idea, inspiration) VALUES (?, ?, ?)",
    [req.userId, idea, inspiration || ''],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Poetry idea saved" });
    }
  );
});

// Workouts
app.get("/workouts", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY target_date DESC",
    [req.userId],
    (err, workouts) => {
      if (err) return res.status(500).json({ error: "Server error" });
      
      // Get exercises for each workout
      const workoutPromises = workouts.map(workout => {
        return new Promise((resolve) => {
          db.all(
            "SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index",
            [workout.id],
            (err, exercises) => {
              resolve({
                ...workout,
                exercises: err ? [] : exercises
              });
            }
          );
        });
      });
      
      Promise.all(workoutPromises)
        .then(workoutsWithExercises => res.json(workoutsWithExercises));
    }
  );
});

app.post("/workouts", authMiddleware, (req, res) => {
  const { name, description, target_date, target_time, recurring_type, recurring_days, reminder_enabled, reminder_minutes, exercises } = req.body;
  
  db.run(
    "INSERT INTO workouts (user_id, name, description, target_date, target_time, recurring_type, recurring_days, reminder_enabled, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [req.userId, name, description, target_date, target_time, recurring_type || 'none', recurring_days || '', reminder_enabled !== false, reminder_minutes || 15],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      
      const workoutId = this.lastID;
      
      // Insert exercises if provided
      if (exercises && exercises.length > 0) {
        const exercisePromises = exercises.map((exercise, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              "INSERT INTO workout_exercises (workout_id, exercise_name, sets, reps, weight, duration, distance, notes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [workoutId, exercise.exercise_name, exercise.sets, exercise.reps, exercise.weight, exercise.duration, exercise.distance, exercise.notes, index],
              (err) => {
                if (err) reject(err);
                else resolve(true);
              }
            );
          });
        });
        
        Promise.all(exercisePromises)
          .then(() => res.json({ id: workoutId, message: "Workout created with exercises" }))
          .catch(() => res.status(500).json({ error: "Error adding exercises" }));
      } else {
        res.json({ id: workoutId, message: "Workout created" });
      }
    }
  );
});

app.put("/workouts/:id/complete", authMiddleware, (req, res) => {
  const { duration, calories_burned, notes } = req.body;
  db.run(
    "UPDATE workouts SET completed = TRUE, completion_date = CURRENT_TIMESTAMP, duration = ?, calories_burned = ?, notes = ? WHERE id = ? AND user_id = ?",
    [duration, calories_burned, notes, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Workout completed" });
    }
  );
});

// Meals
app.get("/meals", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM meals WHERE user_id = ? ORDER BY meal_time DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/meals", authMiddleware, upload.single('photo'), (req, res) => {
  const { meal_name, description, calories, meal_time } = req.body;
  const photo_path = req.file ? req.file.filename : null;
  
  db.run(
    "INSERT INTO meals (user_id, meal_name, description, calories, photo_path, meal_time) VALUES (?, ?, ?, ?, ?, ?)",
    [req.userId, meal_name, description, calories, photo_path, meal_time || new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Meal logged" });
    }
  );
});

// Notes
app.get("/notes", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/notes", authMiddleware, (req, res) => {
  const { title, content, category, tags } = req.body;
  db.run(
    "INSERT INTO notes (user_id, title, content, category, tags) VALUES (?, ?, ?, ?, ?)",
    [req.userId, title, content, category || 'general', tags || ''],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, message: "Note saved" });
    }
  );
});

// Daily goals
app.get("/goals/:date", authMiddleware, (req, res) => {
  db.get(
    "SELECT * FROM daily_goals WHERE user_id = ? AND goal_date = ?",
    [req.userId, req.params.date],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(row || {});
    }
  );
});

app.post("/goals", authMiddleware, (req, res) => {
  const { goal_date, calorie_goal, water_goal, exercise_goal } = req.body;
  db.run(
    "INSERT OR REPLACE INTO daily_goals (user_id, goal_date, calorie_goal, water_goal, exercise_goal, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
    [req.userId, goal_date, calorie_goal, water_goal, exercise_goal],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Goals updated" });
    }
  );
});

// Daily todos
app.get("/todos/daily", authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(
    "SELECT * FROM daily_todos WHERE user_id = ? AND date = ? ORDER BY created_at ASC",
    [req.userId, today],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json(rows);
    }
  );
});

app.post("/todos", authMiddleware, (req, res) => {
  const { text, date } = req.body;
  db.run(
    "INSERT INTO daily_todos (user_id, text, date) VALUES (?, ?, ?)",
    [req.userId, text, date || new Date().toISOString().split('T')[0]],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ id: this.lastID, text, completed: false, message: "Todo created" });
    }
  );
});

app.put("/todos/:id/toggle", authMiddleware, (req, res) => {
  db.run(
    "UPDATE daily_todos SET completed = NOT completed WHERE id = ? AND user_id = ?",
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Todo toggled" });
    }
  );
});

app.delete("/todos/:id", authMiddleware, (req, res) => {
  db.run(
    "DELETE FROM daily_todos WHERE id = ? AND user_id = ?",
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Todo deleted" });
    }
  );
});

// Daily tracking
app.post("/daily-tracking", authMiddleware, (req, res) => {
  const { daily_steps, calories_consumed, date } = req.body;
  db.run(
    "INSERT OR REPLACE INTO daily_goals (user_id, goal_date, daily_steps, calorie_goal, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
    [req.userId, date, daily_steps, calories_consumed],
    function(err) {
      if (err) return res.status(500).json({ error: "Server error" });
      res.json({ message: "Daily tracking updated" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`✅ Personal Development Journal API running at http://localhost:${PORT}`);
});
