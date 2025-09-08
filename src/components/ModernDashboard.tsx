import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Target, Heart, BookOpen, Dumbbell, Camera, Plus, ArrowRight, Sparkles, Sun, Moon, Edit3, Save, X } from 'lucide-react';

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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3 text-muted">Loading your dashboard...</div>
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
    <div className="container-fluid">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" 
               style={{ 
                 borderRadius: '20px',
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 color: 'white'
               }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center mb-3">
                    <TimeIcon size={32} className="me-3 opacity-90" />
                    <div>
                      <h2 className="mb-1">Good {timeOfDay}!</h2>
                      <p className="mb-0 opacity-90">Ready to continue your personal growth journey?</p>
                    </div>
                  </div>
                  
                  {!showMainJournal ? (
                    <div 
                      className="bg-white bg-opacity-20 p-3 rounded-3 mb-0"
                      style={{ cursor: 'pointer', minHeight: '120px' }}
                      onClick={() => setShowMainJournal(true)}
                    >
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <BookOpen size={20} className="me-2 opacity-75" />
                          <small className="fw-bold opacity-90">Today's Journal</small>
                        </div>
                        <Edit3 size={16} className="opacity-75" />
                      </div>
                      
                      <div className="text-center py-4 d-flex flex-column justify-content-center" style={{ minHeight: '80px' }}>
                        <BookOpen size={32} className="mb-2 opacity-60" />
                        <p className="mb-0 opacity-90">Click here to write about your day...</p>
                        <small className="opacity-75 mt-1">Capture your thoughts, feelings, and reflections</small>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3 p-3 mb-0" style={{ minHeight: '120px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <BookOpen size={20} className="me-2" style={{ color: '#667eea' }} />
                          <h6 className="mb-0" style={{ color: '#2c3e50' }}>Today's Journal Entry</h6>
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm me-2"
                            onClick={handleMainJournalSave}
                            style={{ 
                              background: '#43e97b',
                              border: 'none',
                              color: 'white',
                              borderRadius: '20px',
                              padding: '4px 12px'
                            }}
                          >
                            <Save size={14} className="me-1" />
                            Save
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={() => {
                              setShowMainJournal(false);
                              setMainJournalEntry('');
                            }}
                            style={{ 
                              background: '#6c757d',
                              border: 'none',
                              color: 'white',
                              borderRadius: '20px',
                              padding: '4px 12px'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <textarea
                        value={mainJournalEntry}
                        onChange={(e) => setMainJournalEntry(e.target.value)}
                        placeholder="What happened today? How do you feel? What did you learn?"
                        className="form-control border-0 w-100"
                        style={{ 
                          background: '#f8f9fa',
                          color: '#2c3e50',
                          resize: 'none',
                          minHeight: '100px',
                          fontSize: '1rem',
                          lineHeight: '1.5'
                        }}
                        autoFocus
                      />
                    </div>
                  )}
                  
                  {/* Daily Wisdom Quote */}
                  <div className="mt-3">
                    <div className="bg-white bg-opacity-15 p-2 rounded-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <Sparkles size={16} className="me-2 opacity-75" />
                          <small className="fw-bold opacity-90">Daily Wisdom</small>
                        </div>
                        <button 
                          className="btn btn-sm p-1"
                          onClick={() => setShowMoodSelector(!showMoodSelector)}
                          style={{ background: 'transparent', border: 'none' }}
                        >
                          <Edit3 size={12} className="opacity-75" />
                        </button>
                      </div>
                      
                      {showMoodSelector ? (
                        <div className="mb-2">
                          <small className="fw-bold opacity-90 d-block mb-1">Choose mood:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {moods.map(mood => (
                              <button
                                key={mood.name}
                                className="btn btn-sm border-0 rounded-pill px-2 py-0"
                                style={{ 
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  color: mood.color,
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}
                                onClick={() => getMoodBasedQuote(mood.name.toLowerCase())}
                              >
                                {mood.emoji} {mood.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-1 opacity-95 fst-italic" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                            "{dailyQuote || 'Loading wisdom...'}"
                          </p>
                          <small className="opacity-75">— Stoic Philosopher</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 d-none d-lg-block">
                  <div 
                    className="bg-white bg-opacity-20 rounded-3 p-3 h-100 position-relative"
                    style={{ cursor: 'pointer', minHeight: '120px' }}
                    onClick={() => setShowQuickNote(!showQuickNote)}
                  >
                    {!showQuickNote ? (
                      <div className="text-center d-flex flex-column justify-content-center h-100">
                        <Edit3 size={32} className="mb-2 opacity-75" />
                        <div className="fw-bold">Quick Journal</div>
                        <small className="opacity-75">Click to add a thought</small>
                      </div>
                    ) : (
                      <div className="h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-bold opacity-90">Quick Note</small>
                          <div>
                            <button 
                              className="btn btn-sm p-1 me-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickNoteSave();
                              }}
                              style={{ background: 'transparent', border: 'none' }}
                            >
                              <Save size={16} className="opacity-75" />
                            </button>
                            <button 
                              className="btn btn-sm p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowQuickNote(false);
                                setQuickNote('');
                              }}
                              style={{ background: 'transparent', border: 'none' }}
                            >
                              <X size={16} className="opacity-75" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={quickNote}
                          onChange={(e) => setQuickNote(e.target.value)}
                          placeholder="What's on your mind?"
                          className="form-control border-0 flex-grow-1"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2c3e50',
                            resize: 'none',
                            minHeight: '80px',
                            fontSize: '0.9rem'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#f093fb20' }}>
                <BookOpen size={28} style={{ color: '#f093fb' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.journalEntries}</h3>
              <p className="text-muted mb-0">Journal Entries</p>
              <small className="text-muted">Total written</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#43e97b20' }}>
                <Dumbbell size={28} style={{ color: '#43e97b' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.todayWorkouts}</h3>
              <p className="text-muted mb-0">Today's Workouts</p>
              <small className="text-muted">Scheduled</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#fd79a820' }}>
                <Camera size={28} style={{ color: '#fd79a8' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.todayMeals}</h3>
              <p className="text-muted mb-0">Meals Logged</p>
              <small className="text-muted">Today</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#ff6b6b20' }}>
                <Heart size={28} style={{ color: '#ff6b6b' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.upcomingReminders}</h3>
              <p className="text-muted mb-0">Reminders</p>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                     style={{ width: '40px', height: '40px', backgroundColor: '#6c5ce720' }}>
                  <Target size={20} style={{ color: '#6c5ce7' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Daily Calorie Goal</h5>
                  <small className="text-muted">Track your nutrition progress</small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-dark fw-medium">{stats.caloriesConsumed} / {stats.calorieGoal} calories</span>
                  <span className="fw-bold" style={{ color: calorieProgress > 100 ? '#ff6b6b' : '#43e97b' }}>
                    {Math.round(calorieProgress)}%
                  </span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${Math.min(calorieProgress, 100)}%`,
                      background: calorieProgress > 100 
                        ? 'linear-gradient(90deg, #ff6b6b, #ff8e8e)' 
                        : 'linear-gradient(90deg, #43e97b, #38d9a9)',
                      borderRadius: '10px'
                    }}
                  ></div>
                </div>
              </div>
              
              {calorieProgress > 100 && (
                <small className="text-warning">⚠️ You've exceeded your daily calorie goal</small>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                     style={{ width: '40px', height: '40px', backgroundColor: '#4facfe20' }}>
                  <Calendar size={20} style={{ color: '#4facfe' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Today's Focus</h5>
                  <small className="text-muted">Your daily priorities</small>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                  <span className="text-dark">Complete workouts</span>
                  <span className={`badge ${stats.todayWorkouts > 0 ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                    {stats.todayWorkouts > 0 ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                  <span className="text-dark">Log meals</span>
                  <span className={`badge ${stats.todayMeals >= 3 ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                    {stats.todayMeals}/3
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-dark">Journal reflection</span>
                  <span className="badge bg-info rounded-pill">Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Quick Actions</h5>
              <div className="row g-3">
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('journal')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #f093fb20, #f093fb10)',
                      minHeight: '80px'
                    }}>
                    <BookOpen size={24} style={{ color: '#f093fb' }} className="mb-2" />
                    <div className="small fw-medium text-dark">New Journal</div>
                  </button>
                </div>
                
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('workouts')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #43e97b20, #43e97b10)',
                      minHeight: '80px'
                    }}>
                    <Dumbbell size={24} style={{ color: '#43e97b' }} className="mb-2" />
                    <div className="small fw-medium text-dark">Add Workout</div>
                  </button>
                </div>
                
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('meals')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #fd79a820, #fd79a810)',
                      minHeight: '80px'
                    }}>
                    <Camera size={24} style={{ color: '#fd79a8' }} className="mb-2" />
                    <div className="small fw-medium text-dark">Log Meal</div>
                  </button>
                </div>
                
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('ideas')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #4facfe20, #4facfe10)',
                      minHeight: '80px'
                    }}>
                    <Plus size={24} style={{ color: '#4facfe' }} className="mb-2" />
                    <div className="small fw-medium text-dark">Capture Idea</div>
                  </button>
                </div>
                
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('mood')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #ff6b6b20, #ff6b6b10)',
                      minHeight: '80px'
                    }}>
                    <Heart size={24} style={{ color: '#ff6b6b' }} className="mb-2" />
                    <div className="small fw-medium text-dark">Track Mood</div>
                  </button>
                </div>
                
                <div className="col-lg-2 col-md-4 col-6">
                  <button 
                    className="btn w-100 h-100 border-0" 
                    onClick={() => onPageChange?.('export')}
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #a8edea20, #a8edea10)',
                      minHeight: '80px'
                    }}>
                    <ArrowRight size={24} style={{ color: '#a8edea' }} className="mb-2" />
                    <div className="small fw-medium text-dark">Export Data</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;