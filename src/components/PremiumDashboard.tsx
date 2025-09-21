import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Target, Heart, BookOpen, Dumbbell, Camera, Plus, ArrowRight, 
  Sparkles, Sun, Moon, Edit3, Save, X, TrendingUp, Activity, Brain, 
  Smile, ChevronRight, Star, Zap, Award
} from 'lucide-react';

interface DashboardStats {
  journalEntries: number;
  todayWorkouts: number;
  todayMeals: number;
  weeklyMoodAverage: number;
  upcomingReminders: number;
  calorieGoal: number;
  caloriesConsumed: number;
}

interface PremiumDashboardProps {
  onPageChange?: (page: string) => void;
}

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ onPageChange }) => {
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

        const quoteResponse = await fetch('http://localhost:5001/daily');
        const quoteData = await quoteResponse.json();
        setDailyQuote(quoteData.quote);

        const today = new Date().toISOString().split('T')[0];

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

  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  const TimeIcon = currentHour < 18 ? Sun : Moon;
  const calorieProgress = (stats.caloriesConsumed / stats.calorieGoal) * 100;

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
    { name: 'Happy', emoji: '😊', color: 'emerald', bgColor: 'bg-emerald-500' },
    { name: 'Sad', emoji: '😔', color: 'slate', bgColor: 'bg-slate-500' },
    { name: 'Anxious', emoji: '😰', color: 'amber', bgColor: 'bg-amber-500' },
    { name: 'Angry', emoji: '😠', color: 'red', bgColor: 'bg-red-500' },
    { name: 'Calm', emoji: '😌', color: 'blue', bgColor: 'bg-blue-500' }
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
        const updatedStats = { ...stats, journalEntries: stats.journalEntries + 1 };
        setStats(updatedStats);
      }
    } catch (error) {
      console.error('Error saving main journal entry:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <TimeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Good {timeOfDay}! 
                  </h1>
                  <p className="text-white/70 text-lg">Ready to unlock your potential today?</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm font-medium mb-1">TODAY</p>
                <p className="text-white text-xl font-semibold">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Journal Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Today's Reflection</h2>
                    <p className="text-white/60 text-sm">Capture your thoughts and insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span className="text-white/80 text-sm font-medium">{stats.journalEntries} entries</span>
                </div>
              </div>
              
              {!showMainJournal ? (
                <div 
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all duration-300"
                  onClick={() => setShowMainJournal(true)}
                >
                  <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Start writing...</h3>
                  <p className="text-white/60">What happened today? How did it make you feel? What did you learn?</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Writing your reflection</h3>
                    <div className="flex gap-2">
                      <button 
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        onClick={handleMainJournalSave}
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button 
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        onClick={() => {
                          setShowMainJournal(false);
                          setMainJournalEntry('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={mainJournalEntry}
                    onChange={(e) => setMainJournalEntry(e.target.value)}
                    placeholder="What happened today? How are you feeling? What insights did you gain?"
                    className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-4 hover-lift">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.journalEntries}</p>
                    <p className="text-blue-300 text-sm">Entries</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 p-4 hover-lift">
                <div className="flex items-center gap-3 mb-2">
                  <Dumbbell className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.todayWorkouts}</p>
                    <p className="text-emerald-300 text-sm">Workouts</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-xl border border-amber-500/30 p-4 hover-lift">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.todayMeals}</p>
                    <p className="text-amber-300 text-sm">Meals</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-r from-pink-500/20 to-pink-600/20 backdrop-blur-xl border border-pink-500/30 p-4 hover-lift">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8 text-pink-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.upcomingReminders}</p>
                    <p className="text-pink-300 text-sm">Reminders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Notes */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Quick Notes</h3>
                </div>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              
              {!showQuickNote ? (
                <div 
                  className="border border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all"
                  onClick={() => setShowQuickNote(true)}
                >
                  <Plus className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Capture a quick thought</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/80 text-sm">Jot it down</span>
                    <div className="flex gap-1">
                      <button 
                        className="p-1 hover:bg-white/10 rounded"
                        onClick={handleQuickNoteSave}
                      >
                        <Save className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button 
                        className="p-1 hover:bg-white/10 rounded"
                        onClick={() => {
                          setShowQuickNote(false);
                          setQuickNote('');
                        }}
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-20 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Daily Wisdom */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Daily Wisdom</h3>
                </div>
                <button 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                >
                  <Brain className="w-5 h-5 text-white/60" />
                </button>
              </div>
              
              {showMoodSelector ? (
                <div className="space-y-4">
                  <p className="text-white/80 text-sm font-medium">How are you feeling?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {moods.map(mood => (
                      <button
                        key={mood.name}
                        className={`p-3 rounded-xl border-2 border-transparent hover:border-white/30 transition-all flex flex-col items-center gap-2 ${mood.bgColor}/20 hover:${mood.bgColor}/30`}
                        onClick={() => getMoodBasedQuote(mood.name.toLowerCase())}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-white text-xs font-medium">{mood.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <blockquote className="text-white/90 italic leading-relaxed">
                    "{dailyQuote || 'Loading wisdom...'}"
                  </blockquote>
                  <cite className="text-white/60 text-sm">— Ancient Stoic Wisdom</cite>
                </div>
              )}
            </div>

            {/* Progress Card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Daily Goal</h3>
                  <p className="text-white/60 text-sm">Nutrition tracking</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{stats.caloriesConsumed} / {stats.calorieGoal} cal</span>
                  <span className={`font-semibold ${calorieProgress > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.round(calorieProgress)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      calorieProgress > 100 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  ></div>
                </div>
                {calorieProgress > 100 && (
                  <p className="text-red-400 text-xs">⚠️ Goal exceeded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              <p className="text-white/60 text-sm">Jump into your favorite activities</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: BookOpen, label: 'Journal', page: 'journal', color: 'from-blue-500 to-blue-600' },
              { icon: Dumbbell, label: 'Workout', page: 'workouts', color: 'from-emerald-500 to-emerald-600' },
              { icon: Camera, label: 'Meals', page: 'meals', color: 'from-amber-500 to-amber-600' },
              { icon: Plus, label: 'Ideas', page: 'ideas', color: 'from-purple-500 to-purple-600' },
              { icon: Smile, label: 'Mood', page: 'mood', color: 'from-pink-500 to-pink-600' },
              { icon: TrendingUp, label: 'Export', page: 'export', color: 'from-indigo-500 to-indigo-600' },
            ].map((action, index) => (
              <button
                key={action.label}
                className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 p-4 transition-all duration-300 hover:scale-105"
                onClick={() => onPageChange?.(action.page)}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium text-sm">{action.label}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;