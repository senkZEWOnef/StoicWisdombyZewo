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
      water_goal INTEGER DEFAULT 8,
      exercise_goal TEXT,
      daily_steps INTEGER DEFAULT 0,
      steps_goal INTEGER DEFAULT 10000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, goal_date)
    )`);

    // Daily todos table
    await pool.query(`CREATE TABLE IF NOT EXISTS daily_todos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// Initialize tables when the module is loaded (non-blocking)
initializeDatabase().catch(console.error);

module.exports = pool;