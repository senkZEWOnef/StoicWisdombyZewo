require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('New client connected to the database');
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Journal entries table
    await pool.query(`CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Ideas table
    await pool.query(`CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Reminders table
    await pool.query(`CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      reminder_date TIMESTAMP NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Schedule/Calendar events table
    await pool.query(`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP,
      event_type VARCHAR(100) DEFAULT 'meeting',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Mood entries table (enhanced)
    await pool.query(`CREATE TABLE IF NOT EXISTS mood_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      mood VARCHAR(50) NOT NULL,
      energy_level INTEGER,
      notes TEXT,
      stoic_quote TEXT,
      entry_type VARCHAR(20) DEFAULT 'general',
      entry_date DATE DEFAULT CURRENT_DATE,
      one_word_feeling VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Poetry table
    await pool.query(`CREATE TABLE IF NOT EXISTS poetry (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Poetry ideas table
    await pool.query(`CREATE TABLE IF NOT EXISTS poetry_ideas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      idea TEXT NOT NULL,
      inspiration TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Notes table
    await pool.query(`CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Workouts table
    await pool.query(`CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      target_date DATE NOT NULL,
      target_time TIME,
      recurring_type VARCHAR(50) DEFAULT 'none',
      recurring_days TEXT,
      completed BOOLEAN DEFAULT FALSE,
      completion_date TIMESTAMP,
      duration INTEGER,
      calories_burned INTEGER,
      notes TEXT,
      reminder_enabled BOOLEAN DEFAULT TRUE,
      reminder_minutes INTEGER DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Workout exercises table
    await pool.query(`CREATE TABLE IF NOT EXISTS workout_exercises (
      id SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL,
      exercise_name VARCHAR(255) NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight DECIMAL,
      duration INTEGER,
      distance DECIMAL,
      notes TEXT,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
    )`);

    // Meals table
    await pool.query(`CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      meal_name VARCHAR(255) NOT NULL,
      description TEXT,
      calories INTEGER,
      photo_path TEXT,
      meal_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Daily goals table
    await pool.query(`CREATE TABLE IF NOT EXISTS daily_goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      goal_date DATE NOT NULL,
      calorie_goal INTEGER,
      water_goal INTEGER DEFAULT 64,
      water_oz INTEGER DEFAULT 0,
      exercise_goal TEXT,
      daily_steps INTEGER DEFAULT 0,
      steps_goal INTEGER DEFAULT 10000,
      books_read INTEGER DEFAULT 0,
      book_notes INTEGER DEFAULT 0,
      ideas INTEGER DEFAULT 0,
      bible_lectures INTEGER DEFAULT 0,
      recovery_score INTEGER DEFAULT 0,
      strain_score DECIMAL(3,1) DEFAULT 0,
      sleep_hours DECIMAL(3,1) DEFAULT 0,
      sleep_efficiency INTEGER DEFAULT 0,
      hrv_score INTEGER DEFAULT 0,
      resting_hr INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, goal_date)
    )`);

    // Add WHOOP-style columns if they don't exist
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS recovery_score INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS strain_score DECIMAL(3,1) DEFAULT 0`);
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(3,1) DEFAULT 0`);
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS sleep_efficiency INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS hrv_score INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS resting_hr INTEGER DEFAULT 0`);
    
    // Add calories_out column for tracking calories burned
    await pool.query(`ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS calories_out INTEGER DEFAULT 0`);
    
    // Add new columns to mood_entries if they don't exist
    await pool.query(`ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS entry_type VARCHAR(20) DEFAULT 'general'`);
    await pool.query(`ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE`);
    await pool.query(`ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS one_word_feeling VARCHAR(100)`);

    // Daily todos table
    await pool.query(`CREATE TABLE IF NOT EXISTS daily_todos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      date DATE NOT NULL,
      category VARCHAR(50) DEFAULT 'work',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Add category column if it doesn't exist
    await pool.query(`ALTER TABLE daily_todos ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'work'`);

    // Books table
    await pool.query(`CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(100),
      description TEXT,
      cover_image VARCHAR(255),
      status VARCHAR(50) DEFAULT 'want-to-read' CHECK (status IN ('want-to-read', 'reading', 'completed')),
      rating INTEGER CHECK (rating >= 0 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Book notes table
    await pool.query(`CREATE TABLE IF NOT EXISTS book_notes (
      id SERIAL PRIMARY KEY,
      book_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image_path VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    )`);

    // Community photos table for USDA foods
    await pool.query(`CREATE TABLE IF NOT EXISTS community_photos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      fdc_id INTEGER NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Add index for faster lookups
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_community_photos_fdc_id ON community_photos (fdc_id)`);

    // Workout sessions table
    await pool.query(`CREATE TABLE IF NOT EXISTS workout_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      session_name VARCHAR(255) NOT NULL,
      workout_date DATE NOT NULL,
      total_duration INTEGER DEFAULT 0,
      total_calories INTEGER DEFAULT 0,
      notes TEXT,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Workout session exercises table
    await pool.query(`CREATE TABLE IF NOT EXISTS workout_session_exercises (
      id SERIAL PRIMARY KEY,
      workout_session_id INTEGER NOT NULL,
      exercise_name VARCHAR(255) NOT NULL,
      exercise_category VARCHAR(100),
      primary_muscles JSONB,
      equipment VARCHAR(255),
      sets INTEGER,
      reps INTEGER,
      weight DECIMAL,
      duration INTEGER,
      distance DECIMAL,
      rest_time INTEGER,
      calories_burned INTEGER DEFAULT 0,
      notes TEXT,
      exercise_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE
    )`);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// Initialize tables when the module is loaded (non-blocking)
initializeDatabase().catch(console.error);

module.exports = pool;