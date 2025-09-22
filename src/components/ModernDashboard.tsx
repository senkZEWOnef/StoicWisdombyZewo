import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Target, Heart, BookOpen, Dumbbell, Camera, Plus, Sparkles, Sun, Moon, Edit3, Save, X, TrendingUp, Activity, Brain, Smile } from 'lucide-react';

interface DashboardStats {
  journalEntries: number;
  todayWorkouts: number;
  todayMeals: number;
  weeklyMoodAverage: number;
  upcomingReminders: number;
  calorieGoal: number;
  caloriesConsumed: number;
}

interface ModernDashboardProps {
  onPageChange?: (page: string) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ onPageChange }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    journalEntries: 0,
    todayWorkouts: 0,
    todayMeals: 0,
    weeklyMoodAverage: 0,
    upcomingReminders: 0,
    calorieGoal: 2000,
    caloriesConsumed: 0
  });
  const [dailyQuote, setDailyQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [mainJournalEntry, setMainJournalEntry] = useState('');
  const [showMainJournal, setShowMainJournal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch daily quote
        const quoteResponse = await fetch('http://localhost:5001/daily');
        const quoteData = await quoteResponse.json();
        setDailyQuote(quoteData.quote);

        // Fetch today's date
        const today = new Date().toISOString().split('T')[0];

        // Fetch various data in parallel
        const [journalRes, workoutsRes, mealsRes, goalsRes, remindersRes] = await Promise.all([
          fetch('http://localhost:5001/journal', { headers }),
          fetch('http://localhost:5001/workouts', { headers }),
          fetch('http://localhost:5001/meals', { headers }),
          fetch(`http://localhost:5001/goals/${today}`, { headers }),
          fetch('http://localhost:5001/reminders', { headers })
        ]);

        const [journal, workouts, meals, goals, reminders] = await Promise.all([
          journalRes.json(),
          workoutsRes.json(),
          mealsRes.json(),
          goalsRes.json(),
          remindersRes.json()
        ]);

        // Calculate stats
        const todayWorkouts = workouts.filter((w: any) => 
          new Date(w.target_date).toDateString() === new Date().toDateString()
        ).length;

        const todayMeals = meals.filter((m: any) => 
          new Date(m.meal_time).toDateString() === new Date().toDateString()
        );

        const todayCalories = todayMeals.reduce((sum: number, meal: any) => 
          sum + (meal.calories || 0), 0
        );

        const upcomingReminders = reminders.filter((r: any) => 
          !r.completed && new Date(r.reminder_date) >= new Date()
        ).length;

        setStats({
          journalEntries: journal.length,
          todayWorkouts,
          todayMeals: todayMeals.length,
          weeklyMoodAverage: 7,
          upcomingReminders,
          calorieGoal: goals.calorie_goal || 2000,
          caloriesConsumed: todayCalories
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const calorieProgress = (stats.caloriesConsumed / stats.calorieGoal) * 100;
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  const timeIcon = currentHour < 18 ? Sun : Moon;
  const TimeIcon = timeIcon;

  const handleQuickNoteSave = async () => {
    if (!quickNote.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5001/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: quickNote })
      });
      
      if (response.ok) {
        setQuickNote('');
        setShowQuickNote(false);
        // Refresh stats to show new journal entry
        const updatedStats = { ...stats, journalEntries: stats.journalEntries + 1 };
        setStats(updatedStats);
      }
    } catch (error) {
      console.error('Error saving quick note:', error);
    }
  };

  const getMoodBasedQuote = async (mood: string) => {
    try {
      const response = await fetch('http://localhost:5001/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mood })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailyQuote(data.quote);
        setShowMoodSelector(false);
      }
    } catch (error) {
      console.error('Error getting mood quote:', error);
    }
  };

  const moods = [
    { name: 'Happy', emoji: '😊', color: '#43e97b' },
    { name: 'Sad', emoji: '😔', color: '#6c757d' },
    { name: 'Anxious', emoji: '😰', color: '#ffc107' },
    { name: 'Angry', emoji: '😠', color: '#dc3545' },
    { name: 'Calm', emoji: '😌', color: '#17a2b8' }
  ];

  const handleMainJournalSave = async () => {
    if (!mainJournalEntry.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5001/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: mainJournalEntry })
      });
      
      if (response.ok) {
        setMainJournalEntry('');
        setShowMainJournal(false);
        // Refresh stats to show new journal entry
        const updatedStats = { ...stats, journalEntries: stats.journalEntries + 1 };
        setStats(updatedStats);
      }
    } catch (error) {
      console.error('Error saving main journal entry:', error);
    }
  };

  return (
    <div className="modern-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="greeting-section">
            <div className="greeting-content">
              <TimeIcon className="time-icon" />
              <div className="greeting-text">
                <h1>Good {timeOfDay}!</h1>
                <p>Ready to continue your growth journey?</p>
              </div>
            </div>
            <div className="date-info">
              <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Journal Section */}
          <div className="journal-section">
            <div className="section-header">
              <div className="section-title">
                <BookOpen className="section-icon" />
                <span>Today's Reflection</span>
              </div>
            </div>
            
            {!showMainJournal ? (
              <div className="journal-placeholder" onClick={() => setShowMainJournal(true)}>
                <div className="placeholder-content">
                  <BookOpen className="placeholder-icon" />
                  <h3>Start writing...</h3>
                  <p>Capture your thoughts, experiences, and insights from today</p>
                </div>
              </div>
            ) : (
              <div className="journal-active">
                <div className="journal-header">
                  <div className="journal-title">
                    <BookOpen className="journal-icon" />
                    <span>Today's Journal Entry</span>
                  </div>
                  <div className="journal-actions">
                    <button className="save-btn" onClick={handleMainJournalSave}>
                      <Save size={16} />
                      Save
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setShowMainJournal(false);
                      setMainJournalEntry('');
                    }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={mainJournalEntry}
                  onChange={(e) => setMainJournalEntry(e.target.value)}
                  placeholder="What happened today? How are you feeling? What did you learn?"
                  className="journal-textarea"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Quick Notes Section */}
          <div className="quick-notes-section">
            <div className="section-header">
              <div className="section-title">
                <Edit3 className="section-icon" />
                <span>Quick Notes</span>
              </div>
            </div>
            
            {!showQuickNote ? (
              <div className="notes-placeholder" onClick={() => setShowQuickNote(true)}>
                <div className="placeholder-content">
                  <Edit3 className="placeholder-icon" />
                  <h4>Capture a thought</h4>
                  <p>Quick ideas, reminders, or observations</p>
                </div>
              </div>
            ) : (
              <div className="notes-active">
                <div className="notes-header">
                  <span>Quick Thought</span>
                  <div className="notes-actions">
                    <button className="save-btn-sm" onClick={(e) => {
                      e.stopPropagation();
                      handleQuickNoteSave();
                    }}>
                      <Save size={14} />
                    </button>
                    <button className="cancel-btn-sm" onClick={(e) => {
                      e.stopPropagation();
                      setShowQuickNote(false);
                      setQuickNote('');
                    }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="What's on your mind?"
                  className="notes-textarea"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Wisdom Section */}
          <div className="wisdom-section">
            <div className="section-header">
              <div className="section-title">
                <Sparkles className="section-icon" />
                <span>Daily Wisdom</span>
              </div>
              <button 
                className="mood-toggle-btn"
                onClick={() => setShowMoodSelector(!showMoodSelector)}
              >
                <Brain size={16} />
              </button>
            </div>
            
            {showMoodSelector ? (
              <div className="mood-selector">
                <h4>How are you feeling?</h4>
                <div className="mood-grid">
                  {moods.map(mood => (
                    <button
                      key={mood.name}
                      className="mood-btn"
                      style={{ '--mood-color': mood.color } as React.CSSProperties}
                      onClick={() => getMoodBasedQuote(mood.name.toLowerCase())}
                    >
                      <span className="mood-emoji">{mood.emoji}</span>
                      <span className="mood-name">{mood.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="wisdom-content">
                <blockquote className="wisdom-quote">
                  "{dailyQuote || 'Loading wisdom...'}"
                </blockquote>
                <cite className="wisdom-author">— Stoic Philosophy</cite>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ '--stat-color': '#8B5CF6' } as React.CSSProperties}>
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.journalEntries}</div>
              <div className="stat-label">Journal Entries</div>
              <div className="stat-sublabel">Total written</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ '--stat-color': '#10B981' } as React.CSSProperties}>
              <Dumbbell size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.todayWorkouts}</div>
              <div className="stat-label">Workouts</div>
              <div className="stat-sublabel">Today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ '--stat-color': '#F59E0B' } as React.CSSProperties}>
              <Camera size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.todayMeals}</div>
              <div className="stat-label">Meals</div>
              <div className="stat-sublabel">Logged today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ '--stat-color': '#EF4444' } as React.CSSProperties}>
              <Heart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.upcomingReminders}</div>
              <div className="stat-label">Reminders</div>
              <div className="stat-sublabel">Pending</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-grid">
          <div className="progress-card">
            <div className="progress-header">
              <div className="progress-title">
                <Target className="progress-icon" />
                <div>
                  <h3>Calorie Goal</h3>
                  <p>Track your nutrition</p>
                </div>
              </div>
            </div>
            
            <div className="progress-content">
              <div className="progress-stats">
                <span className="current-calories">{stats.caloriesConsumed}</span>
                <span className="goal-calories">/ {stats.calorieGoal} cal</span>
                <span className="progress-percentage" style={{ color: calorieProgress > 100 ? '#EF4444' : '#10B981' }}>
                  {Math.round(calorieProgress)}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${Math.min(calorieProgress, 100)}%`,
                    backgroundColor: calorieProgress > 100 ? '#EF4444' : '#10B981'
                  }}
                />
              </div>
              {calorieProgress > 100 && (
                <div className="progress-warning">⚠️ Exceeded daily goal</div>
              )}
            </div>
          </div>

          <div className="focus-card">
            <div className="focus-header">
              <div className="focus-title">
                <Activity className="focus-icon" />
                <div>
                  <h3>Today's Focus</h3>
                  <p>Daily priorities</p>
                </div>
              </div>
            </div>
            
            <div className="focus-list">
              <div className="focus-item">
                <span>Complete workouts</span>
                <div className={`focus-badge ${stats.todayWorkouts > 0 ? 'active' : 'pending'}`}>
                  {stats.todayWorkouts > 0 ? 'Active' : 'Pending'}
                </div>
              </div>
              <div className="focus-item">
                <span>Log meals</span>
                <div className={`focus-badge ${stats.todayMeals >= 3 ? 'complete' : 'progress'}`}>
                  {stats.todayMeals}/3
                </div>
              </div>
              <div className="focus-item">
                <span>Daily reflection</span>
                <div className="focus-badge daily">Daily</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => onPageChange?.('journal')}>
              <BookOpen className="action-icon" />
              <span>New Journal</span>
            </button>
            
            <button className="action-btn" onClick={() => onPageChange?.('workouts')}>
              <Dumbbell className="action-icon" />
              <span>Add Workout</span>
            </button>
            
            <button className="action-btn" onClick={() => onPageChange?.('meals')}>
              <Camera className="action-icon" />
              <span>Log Meal</span>
            </button>
            
            <button className="action-btn" onClick={() => onPageChange?.('ideas')}>
              <Plus className="action-icon" />
              <span>Capture Idea</span>
            </button>
            
            <button className="action-btn" onClick={() => onPageChange?.('mood')}>
              <Smile className="action-icon" />
              <span>Track Mood</span>
            </button>
            
            <button className="action-btn" onClick={() => onPageChange?.('export')}>
              <TrendingUp className="action-icon" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;