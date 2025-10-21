import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Target, Heart, BookOpen, Dumbbell, Camera, Plus, 
  Sparkles, Sun, Moon, Edit3, Save, X, Activity, Brain, 
  Smile, Star, Zap, Footprints, Flame, CheckSquare,
  Square, Trash2, Droplets, Book, FileText, Lightbulb,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

interface DashboardStats {
  journalEntries: number;
  todayWorkouts: number;
  todayMeals: number;
  weeklyMoodAverage: number;
  upcomingReminders: number;
  caloriesIn: number;
  caloriesOut: number;
  dailySteps: number;
  stepsGoal: number;
  waterOz: number;
  waterGoal: number;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: 'work' | 'habits';
  date: string;
  created_at: string;
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
    caloriesIn: 0,
    caloriesOut: 0,
    dailySteps: 0,
    stepsGoal: 10000,
    waterOz: 0,
    waterGoal: 64
  });
  const [dailyQuote, setDailyQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [dailyStepsInput, setDailyStepsInput] = useState('');
  const [caloriesInInput, setCaloriesInInput] = useState('');
  const [caloriesOutInput, setCaloriesOutInput] = useState('');
  const [waterOzInput, setWaterOzInput] = useState('');
  
  // Date navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // Todo state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<'work' | 'habits'>('work');
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Clear existing data when date changes
        setTodos([]);
        setLoading(true);
        
        // Clear tracking form inputs when date changes
        setDailyStepsInput('');
        setCaloriesInInput('');
        setCaloriesOutInput('');
        setWaterOzInput('');
        setShowTrackingForm(false);
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const quoteResponse = await fetch('http://localhost:5001/daily');
        const quoteData = await quoteResponse.json();
        setDailyQuote(quoteData.quote);

        const selectedDate = currentDate.toISOString().split('T')[0];
        console.log('Fetching data for date:', selectedDate, 'view mode:', viewMode);

        // Calculate date range for week/month views
        let goalsEndpoint = `http://localhost:5001/goals/${selectedDate}`;
        if (viewMode === 'week') {
          const startOfWeek = new Date(currentDate);
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          const startDateStr = startOfWeek.toISOString().split('T')[0];
          const endDateStr = endOfWeek.toISOString().split('T')[0];
          goalsEndpoint = `http://localhost:5001/goals/range/${startDateStr}/${endDateStr}`;
        } else if (viewMode === 'month') {
          const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          const startDateStr = startOfMonth.toISOString().split('T')[0];
          const endDateStr = endOfMonth.toISOString().split('T')[0];
          goalsEndpoint = `http://localhost:5001/goals/range/${startDateStr}/${endDateStr}`;
        }

        const [journalRes, workoutsRes, mealsRes, goalsRes, remindersRes, todosRes, workoutStatsRes] = await Promise.all([
          fetch('http://localhost:5001/journal', { headers }),
          fetch(`http://localhost:5001/workout-sessions?date=${selectedDate}`, { headers }),
          fetch('http://localhost:5001/meals', { headers }),
          fetch(goalsEndpoint, { headers }),
          fetch('http://localhost:5001/reminders', { headers }),
          // Only fetch todos for day view
          viewMode === 'day' ? fetch(`http://localhost:5001/todos/daily?date=${selectedDate}`, { headers }) : Promise.resolve({ json: () => Promise.resolve([]) }),
          fetch(`http://localhost:5001/workout-stats/${selectedDate}`, { headers })
        ]);

        const [journal, workouts, meals, goals, reminders, todosData, workoutStats] = await Promise.all([
          journalRes.json(),
          workoutsRes.json(),
          mealsRes.json(),
          goalsRes.json(),
          remindersRes.json(),
          todosRes.json(),
          workoutStatsRes.json()
        ]);

        console.log('Received todos for date', selectedDate, ':', todosData);
        setTodos(todosData);

        // Filter meals by selected date
        const selectedMeals = meals.filter((m: any) => 
          new Date(m.meal_time).toDateString() === currentDate.toDateString()
        );

        const selectedCalories = selectedMeals.reduce((sum: number, meal: any) => 
          sum + (meal.calories || 0), 0
        );

        // Use workout stats from new API
        const selectedWorkouts = workoutStats.session_count || 0;
        const workoutCaloriesBurned = workoutStats.total_calories_burned || 0;

        const upcomingReminders = reminders.filter((r: any) => 
          !r.completed && new Date(r.reminder_date) >= new Date()
        ).length;

        // Parse stats based on view mode (aggregated vs daily)
        let statsData;
        if (viewMode === 'week' || viewMode === 'month') {
          // Use aggregated data
          statsData = {
            journalEntries: journal.length,
            todayWorkouts: selectedWorkouts,
            todayMeals: selectedMeals.length,
            weeklyMoodAverage: 7,
            upcomingReminders,
            caloriesIn: selectedCalories,
            caloriesOut: workoutCaloriesBurned,
            dailySteps: Math.round(goals.avg_daily_steps || 0),
            stepsGoal: 10000, // Keep static goal
            waterOz: Math.round(goals.avg_water_oz || 0),
            waterGoal: 64 // Keep static goal
          };
        } else {
          // Use daily data
          statsData = {
            journalEntries: journal.length,
            todayWorkouts: selectedWorkouts,
            todayMeals: selectedMeals.length,
            weeklyMoodAverage: 7,
            upcomingReminders,
            caloriesIn: selectedCalories,
            caloriesOut: workoutCaloriesBurned,
            dailySteps: goals.daily_steps || 0,
            stepsGoal: goals.steps_goal || 10000,
            waterOz: goals.water_oz || 0,
            waterGoal: goals.water_goal || 64
          };
        }
        
        setStats(statsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, currentDate, viewMode]);

  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  const TimeIcon = currentHour < 18 ? Sun : Moon;
  const calorieDeficit = stats.caloriesOut - stats.caloriesIn; // Positive means deficit
  const stepsProgress = (stats.dailySteps / stats.stepsGoal) * 100;
  const waterProgress = (stats.waterOz / stats.waterGoal) * 100;

  const saveDailyTracking = async () => {
    if (!dailyStepsInput && !caloriesInInput && !caloriesOutInput && !waterOzInput) return;
    
    try {
      const response = await fetch('http://localhost:5001/daily-tracking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          daily_steps: parseInt(dailyStepsInput) || stats.dailySteps,
          calories_in: parseInt(caloriesInInput) || stats.caloriesIn,
          calories_out: parseInt(caloriesOutInput) || stats.caloriesOut,
          water_oz: parseInt(waterOzInput) || stats.waterOz,
          date: currentDate.toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        setStats(prev => ({
          ...prev,
          dailySteps: parseInt(dailyStepsInput) || prev.dailySteps,
          caloriesIn: parseInt(caloriesInInput) || prev.caloriesIn,
          caloriesOut: parseInt(caloriesOutInput) || prev.caloriesOut,
          waterOz: parseInt(waterOzInput) || prev.waterOz
        }));
        
        setDailyStepsInput('');
        setCaloriesInInput('');
        setCaloriesOutInput('');
        setWaterOzInput('');
        setShowTrackingForm(false);
      }
    } catch (error) {
      console.error('Error saving daily tracking:', error);
    }
  };

  // Todo handlers
  const addTodo = async () => {
    console.log('addTodo called with:', { newTodoText, newTodoCategory });
    if (!newTodoText.trim()) {
      console.log('Empty todo text, returning');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/todos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newTodoText,
          category: newTodoCategory,
          date: currentDate.toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        const newTodo = await response.json();
        console.log('New todo response:', newTodo);
        setTodos(prev => [...prev, {
          id: newTodo.id,
          text: newTodo.text || newTodoText,
          category: newTodo.category || newTodoCategory,
          completed: newTodo.completed || false,
          date: currentDate.toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }]);
        setNewTodoText('');
      } else {
        console.error('Failed to add todo:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5001/todos/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const updateTodo = async (id: number, text: string, category: 'work' | 'habits') => {
    try {
      const response = await fetch(`http://localhost:5001/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, category })
      });
      
      if (response.ok) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, text, category } : todo
        ));
        setEditingTodo(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5001/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const workTodos = todos.filter(todo => todo.category === 'work');
  const habitTodos = todos.filter(todo => todo.category === 'habits');

  // Date navigation helpers
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateDisplay = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <TimeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                    Good {timeOfDay}! 
                  </h1>
                  <p className="text-white/70 text-sm sm:text-base lg:text-lg">Ready to unlock your potential today?</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-white/60 text-xs sm:text-sm font-medium mb-1">
                  {isToday ? 'TODAY' : viewMode.toUpperCase()}
                </p>
                <p className="text-white text-lg sm:text-xl font-semibold">
                  {formatDateDisplay()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
          <div className="flex flex-col gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center sm:justify-start">
              <div className="flex bg-white/10 rounded-lg p-1 w-full sm:w-auto">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-indigo-500 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Navigation Controls and Current Date */}
            <div className="flex items-center justify-between gap-4">
              {/* Date Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={`Previous ${viewMode}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={goToToday}
                  disabled={isToday}
                  className={`px-3 xs:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isToday 
                      ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  Today
                </button>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={`Next ${viewMode}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Current Date Display */}
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span className="text-xs xs:text-sm">
                  <span className="xs:hidden">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                  <span className="hidden xs:inline">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Daily Wisdom</h3>
          </div>
          <blockquote className="text-white/90 italic leading-relaxed">
            "{dailyQuote || 'Loading wisdom...'}"
          </blockquote>
          <cite className="text-white/60 text-sm">— Ancient Wisdom</cite>
        </div>

        {/* Enhanced Daily Tracking */}
        <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {viewMode === 'day' ? 'Daily Tracking' : `${viewMode === 'week' ? 'Weekly' : 'Monthly'} Average Tracking`}
                </h2>
                <p className="text-white/60 text-sm">
                  {viewMode === 'day' 
                    ? 'Track your daily activities and progress' 
                    : `Showing average values for this ${viewMode}`
                  }
                </p>
              </div>
            </div>
            {viewMode === 'day' && (
              <button
                onClick={() => setShowTrackingForm(!showTrackingForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Update
              </button>
            )}
          </div>

          {showTrackingForm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-white/80 text-xs mb-1">Steps</label>
                  <input
                    type="number"
                    value={dailyStepsInput}
                    onChange={(e) => setDailyStepsInput(e.target.value)}
                    placeholder={stats.dailySteps.toString()}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-xs mb-1">Calories In</label>
                  <input
                    type="number"
                    value={caloriesInInput}
                    onChange={(e) => setCaloriesInInput(e.target.value)}
                    placeholder={stats.caloriesIn.toString()}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-xs mb-1">Calories Out</label>
                  <input
                    type="number"
                    value={caloriesOutInput}
                    onChange={(e) => setCaloriesOutInput(e.target.value)}
                    placeholder={stats.caloriesOut.toString()}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-xs mb-1">Water (oz)</label>
                  <input
                    type="number"
                    value={waterOzInput}
                    onChange={(e) => setWaterOzInput(e.target.value)}
                    placeholder={stats.waterOz.toString()}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveDailyTracking}
                  className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Tracking
                </button>
                <button
                  onClick={() => {
                    setShowTrackingForm(false);
                    setDailyStepsInput('');
                    setCaloriesInInput('');
                    setCaloriesOutInput('');
                    setWaterOzInput('');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Steps */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80 text-sm font-medium">Steps</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stats.dailySteps.toLocaleString()}</span>
                  <span className="text-white/60 text-sm">/ {stats.stepsGoal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${Math.min(stepsProgress, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${stepsProgress >= 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {Math.round(stepsProgress)}%
                </span>
              </div>

              {/* Calories In */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 text-sm font-medium">Calories In</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stats.caloriesIn.toLocaleString()}</span>
                  <span className="text-white/60 text-sm">consumed</span>
                </div>
              </div>

              {/* Calories Out */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span className="text-white/80 text-sm font-medium">Calories Out</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stats.caloriesOut.toLocaleString()}</span>
                  <span className="text-white/60 text-sm">burned</span>
                </div>
              </div>

              {/* Water */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/80 text-sm font-medium">Water</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stats.waterOz}</span>
                  <span className="text-white/60 text-sm">/ {stats.waterGoal} oz</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-cyan-600"
                    style={{ width: `${Math.min(waterProgress, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${waterProgress >= 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {Math.round(waterProgress)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Meals & Workouts Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Meals Summary Card */}
          <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
                  <p className="text-white/60 text-sm">{stats.todayMeals} meals logged</p>
                </div>
              </div>
              {onPageChange && (
                <button
                  onClick={() => onPageChange('meals')}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Calories Consumed</span>
                <span className="text-white font-semibold">{stats.caloriesIn} cal</span>
              </div>
              
              {stats.todayMeals > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Last meal logged {viewMode === 'day' ? 'today' : `this ${viewMode}`}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full">
                    <div 
                      className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.caloriesIn / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round((stats.caloriesIn / 2000) * 100)}% of 2000 cal target
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Camera className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">No meals logged yet</p>
                  {onPageChange && (
                    <button
                      onClick={() => onPageChange('meals')}
                      className="mt-2 text-orange-400 hover:text-orange-300 text-sm transition-colors"
                    >
                      Log your first meal →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Workouts Summary Card */}
          <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Today's Workouts</h3>
                  <p className="text-white/60 text-sm">{stats.todayWorkouts} sessions completed</p>
                </div>
              </div>
              {onPageChange && (
                <button
                  onClick={() => onPageChange('workouts')}
                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Calories Burned</span>
                <span className="text-white font-semibold">{stats.caloriesOut} cal</span>
              </div>
              
              {stats.todayWorkouts > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">
                      {stats.todayWorkouts === 1 ? '1 session' : `${stats.todayWorkouts} sessions`} completed
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {calorieDeficit > 0 ? `${calorieDeficit} cal deficit` : `${Math.abs(calorieDeficit)} cal surplus`}
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full">
                    <div 
                      className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.caloriesOut / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round((stats.caloriesOut / 500) * 100)}% of 500 cal burn target
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Dumbbell className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">No workouts completed yet</p>
                  {onPageChange && (
                    <button
                      onClick={() => onPageChange('workouts')}
                      className="mt-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      Start your first workout →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Todo Lists - Only show in day view */}
        {viewMode === 'day' ? (
          <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Today's Todos</h2>
                  <p className="text-white/60 text-sm">Plan your day with Work and Habits</p>
                </div>
              </div>
            </div>

          {/* Add New Todo */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <select
              value={newTodoCategory}
              onChange={(e) => setNewTodoCategory(e.target.value as 'work' | 'habits')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-32"
              style={{ colorScheme: 'dark' }}
            >
              <option value="work" style={{ backgroundColor: '#1f2937', color: 'white' }}>Work</option>
              <option value="habits" style={{ backgroundColor: '#1f2937', color: 'white' }}>Habits</option>
            </select>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button
              onClick={addTodo}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Work Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Work</h3>
                <span className="text-white/60 text-sm">({workTodos.length})</span>
              </div>
              
              <div className="space-y-2">
                {workTodos.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No work todos yet</p>
                  </div>
                ) : (
                  workTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        todo.completed 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-white/30 hover:border-blue-400'
                          }`}
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-3 h-3 text-white" />
                          ) : (
                            <Square className="w-3 h-3 text-white/60" />
                          )}
                        </button>
                        
                        {editingTodo === todo.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateTodo(todo.id, editingText, 'work');
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => updateTodo(todo.id, editingText, 'work')}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTodo(null);
                                setEditingText('');
                              }}
                              className="p-1 text-white/60 hover:text-white/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <span className={`text-sm ${
                              todo.completed 
                                ? 'text-white/60 line-through' 
                                : 'text-white'
                            }`}>
                              {todo.text}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTodo(todo.id);
                                  setEditingText(todo.text);
                                }}
                                className="p-1 text-white/40 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Habits Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Habits</h3>
                <span className="text-white/60 text-sm">({habitTodos.length})</span>
              </div>
              
              <div className="space-y-2">
                {habitTodos.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No habit todos yet</p>
                  </div>
                ) : (
                  habitTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-lg border transition-all duration-200 group ${
                        todo.completed 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-white/30 hover:border-emerald-400'
                          }`}
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-3 h-3 text-white" />
                          ) : (
                            <Square className="w-3 h-3 text-white/60" />
                          )}
                        </button>
                        
                        {editingTodo === todo.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateTodo(todo.id, editingText, 'habits');
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => updateTodo(todo.id, editingText, 'habits')}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTodo(null);
                                setEditingText('');
                              }}
                              className="p-1 text-white/60 hover:text-white/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <span className={`text-sm ${
                              todo.completed 
                                ? 'text-white/60 line-through' 
                                : 'text-white'
                            }`}>
                              {todo.text}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTodo(todo.id);
                                  setEditingText(todo.text);
                                }}
                                className="p-1 text-white/40 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{viewMode === 'week' ? 'Weekly' : 'Monthly'} Overview</h2>
                  <p className="text-white/60 text-sm">Todos are only available in day view. Switch to day view to manage your todos.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-lg mb-2">
                {viewMode === 'week' ? 'Weekly View' : 'Monthly View'}
              </p>
              <p className="text-white/60 text-sm">
                The daily tracker above shows {viewMode === 'week' ? 'average' : 'average'} values for this {viewMode}.
                <br />Switch to day view to manage individual todos.
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default PremiumDashboard;