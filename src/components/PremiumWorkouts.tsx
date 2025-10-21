import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { exerciseAPI, type Exercise, type WorkoutInfo } from '../services/exerciseApi';
import { 
  Dumbbell, Plus, CheckCircle, Calendar, Timer, Flame, Save, X, TrendingUp, Target, Award, Activity, Search, Trash2,
  Zap, Database, Loader2, Play, Pause, RotateCcw, Users, Filter, ChevronDown, ChevronUp, Clock, Weight, Repeat
} from 'lucide-react';

interface WorkoutSession {
  id: number;
  session_name: string;
  workout_date: string;
  exercises: WorkoutInfo[];
  total_duration: number;
  total_calories: number;
  notes: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const PremiumWorkouts: React.FC = () => {
  const { token } = useAuth();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Date navigation
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Workout builder states
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{
    session_name: string;
    exercises: WorkoutInfo[];
    notes: string;
  }>({
    session_name: '',
    exercises: [],
    notes: ''
  });
  
  // Exercise search states
  const [exerciseSearchResults, setExerciseSearchResults] = useState<Exercise[]>([]);
  const [searchingExercises, setSearchingExercises] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Exercise configuration
  const [configuringExercise, setConfiguringExercise] = useState<Exercise | null>(null);
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: 3,
    reps: 10,
    weight: 0,
    duration: 0,
    distance: 0,
    restTime: 60,
    notes: ''
  });
  
  // Available filter options
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  
  // Other states
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkoutSessions();
    loadFilterOptions();
  }, [selectedDate]);

  const loadFilterOptions = async () => {
    try {
      const [muscles, equipment] = await Promise.all([
        exerciseAPI.getMuscleGroups(),
        exerciseAPI.getEquipmentTypes()
      ]);
      setMuscleGroups(muscles);
      setEquipmentTypes(equipment);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const fetchWorkoutSessions = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5001/workout-sessions?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutSessions(data);
      }
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchExercises = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchingExercises(true);
    try {
      const results = await exerciseAPI.searchExercises(query, {
        muscle: muscleFilter,
        equipment: equipmentFilter,
        category: categoryFilter,
        limit: 12
      });
      setExerciseSearchResults(results);
      setShowExerciseSearch(true);
    } catch (error) {
      console.error('Error searching exercises:', error);
    } finally {
      setSearchingExercises(false);
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    setConfiguringExercise(exercise);
    setExerciseConfig({
      sets: exercise.category === 'cardio' ? 1 : 3,
      reps: exercise.category === 'cardio' ? 0 : 10,
      weight: 0,
      duration: exercise.category === 'cardio' ? 30 : 0,
      distance: 0,
      restTime: exercise.category === 'cardio' ? 0 : 60,
      notes: ''
    });
  };

  const confirmAddExercise = () => {
    if (!configuringExercise) return;
    
    const userWeight = 70; // TODO: Get from user profile
    const workoutInfo: WorkoutInfo = {
      exercise: configuringExercise,
      sets: exerciseConfig.sets,
      reps: exerciseConfig.reps || undefined,
      weight: exerciseConfig.weight || undefined,
      duration: exerciseConfig.duration || undefined,
      distance: exerciseConfig.distance || undefined,
      restTime: exerciseConfig.restTime || undefined,
      notes: exerciseConfig.notes || undefined,
      calories: exerciseAPI.calculateCalories({
        exercise: configuringExercise,
        sets: exerciseConfig.sets,
        reps: exerciseConfig.reps,
        weight: exerciseConfig.weight,
        duration: exerciseConfig.duration
      }, userWeight)
    };
    
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, workoutInfo]
    }));
    
    setConfiguringExercise(null);
    setShowExerciseSearch(false);
  };

  const removeExerciseFromWorkout = (index: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const saveWorkoutSession = async () => {
    if (!currentWorkout.session_name.trim() || currentWorkout.exercises.length === 0) {
      alert('Please add a workout name and at least one exercise');
      return;
    }
    
    if (!token) {
      alert('Please log in to save workouts');
      return;
    }
    
    setSaving(true);
    try {
      const totalCalories = currentWorkout.exercises.reduce((sum, ex) => sum + (ex.calories || 0), 0);
      const totalDuration = currentWorkout.exercises.reduce((sum, ex) => {
        if (ex.duration) return sum + ex.duration;
        if (ex.sets && ex.reps) {
          const exerciseTime = (ex.sets * ex.reps * 3 + (ex.sets - 1) * (ex.restTime || 60)) / 60;
          return sum + exerciseTime;
        }
        return sum + 5; // Default 5 minutes
      }, 0);
      
      const sessionData = {
        session_name: currentWorkout.session_name,
        workout_date: selectedDate,
        total_duration: Math.round(totalDuration),
        total_calories: totalCalories,
        notes: currentWorkout.notes,
        exercises: currentWorkout.exercises.map(ex => ({
          exercise_name: ex.exercise.name,
          exercise_category: ex.exercise.category,
          primary_muscles: ex.exercise.primaryMuscles,
          equipment: ex.exercise.equipment,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          duration: ex.duration,
          distance: ex.distance,
          rest_time: ex.restTime,
          calories_burned: ex.calories,
          notes: ex.notes,
          exercise_data: ex.exercise
        }))
      };
      
      const response = await fetch('http://localhost:5001/workout-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      if (response.ok) {
        alert('Workout session saved! 💪');
        resetWorkoutBuilder();
        setShowWorkoutBuilder(false);
        fetchWorkoutSessions();
      } else {
        const errorText = await response.text();
        alert(`Failed to save workout: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving workout session:', error);
      alert('Error saving workout session');
    } finally {
      setSaving(false);
    }
  };

  const resetWorkoutBuilder = () => {
    setCurrentWorkout({
      session_name: '',
      exercises: [],
      notes: ''
    });
    setExerciseSearchResults([]);
    setShowExerciseSearch(false);
    setExerciseQuery('');
    setConfiguringExercise(null);
  };

  const deleteWorkoutSession = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to delete this workout session?')) return;
    
    setDeleting(sessionId);
    try {
      const response = await fetch(`http://localhost:5001/workout-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchWorkoutSessions();
      }
    } catch (error) {
      console.error('Error deleting workout session:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayStats = () => {
    const dayWorkouts = workoutSessions.filter(session => 
      session.workout_date === selectedDate
    );
    
    const totalCalories = dayWorkouts.reduce((sum, session) => sum + session.total_calories, 0);
    const totalDuration = dayWorkouts.reduce((sum, session) => sum + session.total_duration, 0);
    const sessionCount = dayWorkouts.length;
    
    return { totalCalories, totalDuration, sessionCount };
  };

  const getPopularExercises = async () => {
    const popular = await exerciseAPI.getPopularExercises(categoryFilter, 6);
    setExerciseSearchResults(popular);
    setShowExerciseSearch(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  const dayStats = getDayStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Workout Tracker</h1>
              <p className="text-white/70">Build workouts, track exercises, and burn calories</p>
              {!token && (
                <div className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg inline-block">
                  <span className="text-red-300 text-sm">⚠️ Please log in to save workouts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <label className="text-white font-medium">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-white/70">{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calories Burned */}
          <div className="lg:col-span-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 lg:p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Calories Burned</h2>
                  <p className="text-white/60">Energy burned through exercise</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Total Burned</p>
                <p className="text-white font-bold text-2xl">{dayStats.totalCalories}</p>
                <p className="text-white/60 text-xs">calories</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Total Time</p>
                <p className="text-white font-bold text-2xl">{formatTime(dayStats.totalDuration)}</p>
                <p className="text-white/60 text-xs">duration</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Sessions</p>
                <p className="text-white font-bold text-2xl">{dayStats.sessionCount}</p>
                <p className="text-white/60 text-xs">workouts</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Workout Status</h3>
            <p className="text-white/60 mb-4">
              {dayStats.sessionCount > 0 
                ? `${dayStats.sessionCount} workout${dayStats.sessionCount > 1 ? 's' : ''} today`
                : 'No workouts today'
              }
            </p>
            <div className="space-y-2">
              {dayStats.totalCalories > 200 && (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Great workout day!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Workout Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowWorkoutBuilder(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3 hover-lift"
          >
            <Plus className="w-5 h-5" />
            Create New Workout
          </button>
        </div>

        {/* Workout Builder */}
        {showWorkoutBuilder && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Build Your Workout</h2>
                  <p className="text-white/60">Create a custom workout session</p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkoutBuilder(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Workout Name */}
              <div>
                <label className="block text-white font-medium mb-2">Workout Name *</label>
                <input
                  type="text"
                  value={currentWorkout.session_name}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, session_name: e.target.value }))}
                  placeholder="e.g., Morning Push Day, Cardio Session..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Exercise Database Search */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Exercise Database
                  </h3>
                  <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-lg">
                    Free Exercise APIs
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Input */}
                  <input
                    type="text"
                    value={exerciseQuery}
                    onChange={(e) => setExerciseQuery(e.target.value)}
                    placeholder="Search exercises (e.g., push up, squat...)"
                    className="md:col-span-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Search Button */}
                  <button
                    onClick={() => searchExercises(exerciseQuery)}
                    disabled={searchingExercises || !exerciseQuery.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {searchingExercises ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search
                  </button>
                  
                  {/* Popular Button */}
                  <button
                    onClick={getPopularExercises}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Popular
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={muscleFilter}
                    onChange={(e) => setMuscleFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Muscles</option>
                    {muscleGroups.map(muscle => (
                      <option key={muscle} value={muscle} className="bg-gray-800">{muscle}</option>
                    ))}
                  </select>
                  
                  <select
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Equipment</option>
                    {equipmentTypes.map(equipment => (
                      <option key={equipment} value={equipment} className="bg-gray-800">{equipment}</option>
                    ))}
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="strength" className="bg-gray-800">Strength</option>
                    <option value="cardio" className="bg-gray-800">Cardio</option>
                    <option value="stretching" className="bg-gray-800">Stretching</option>
                    <option value="powerlifting" className="bg-gray-800">Powerlifting</option>
                  </select>
                </div>
              </div>

              {/* Exercise Search Results */}
              {showExerciseSearch && exerciseSearchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Found {exerciseSearchResults.length} exercises
                    </h4>
                    <button
                      onClick={() => setShowExerciseSearch(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                    {exerciseSearchResults.map((exercise, index) => (
                      <div
                        key={index}
                        className="bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 p-4 transition-all cursor-pointer"
                        onClick={() => addExerciseToWorkout(exercise)}
                      >
                        {/* Exercise Image */}
                        {exercise.images && exercise.images.length > 0 && (
                          <div className="h-32 mb-3 rounded-lg overflow-hidden">
                            <img
                              src={exercise.images[0]}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h5 className="text-white font-semibold">{exercise.name}</h5>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-1 rounded-lg ${
                              exercise.category === 'strength' ? 'bg-orange-500/20 text-orange-300' :
                              exercise.category === 'cardio' ? 'bg-red-500/20 text-red-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {exercise.category}
                            </span>
                            <span className="text-white/60">{exercise.equipment}</span>
                          </div>
                          <div className="text-white/60 text-xs">
                            {exercise.primaryMuscles.join(', ')}
                          </div>
                          <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all text-sm">
                            + Add to Workout
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Configuration Modal */}
              {configuringExercise && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Configure Exercise</h3>
                      <button
                        onClick={() => setConfiguringExercise(null)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">{configuringExercise.name}</h4>
                        <p className="text-white/60 text-sm">{configuringExercise.primaryMuscles.join(', ')}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Sets</label>
                          <input
                            type="number"
                            value={exerciseConfig.sets}
                            onChange={(e) => setExerciseConfig(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                            min="1"
                          />
                        </div>
                        
                        {configuringExercise.category !== 'cardio' ? (
                          <>
                            <div>
                              <label className="block text-white/80 text-sm mb-1">Reps</label>
                              <input
                                type="number"
                                value={exerciseConfig.reps}
                                onChange={(e) => setExerciseConfig(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 text-sm mb-1">Weight (kg)</label>
                              <input
                                type="number"
                                value={exerciseConfig.weight}
                                onChange={(e) => setExerciseConfig(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                min="0"
                                step="0.5"
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 text-sm mb-1">Rest (seconds)</label>
                              <input
                                type="number"
                                value={exerciseConfig.restTime}
                                onChange={(e) => setExerciseConfig(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                min="0"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-white/80 text-sm mb-1">Duration (min)</label>
                              <input
                                type="number"
                                value={exerciseConfig.duration}
                                onChange={(e) => setExerciseConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 text-sm mb-1">Distance (km)</label>
                              <input
                                type="number"
                                value={exerciseConfig.distance}
                                onChange={(e) => setExerciseConfig(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                min="0"
                                step="0.1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Notes (optional)</label>
                        <input
                          type="text"
                          value={exerciseConfig.notes}
                          onChange={(e) => setExerciseConfig(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Personal notes..."
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={confirmAddExercise}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                        >
                          Add to Workout
                        </button>
                        <button
                          onClick={() => setConfiguringExercise(null)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Workout Exercises */}
              {currentWorkout.exercises.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Your Workout ({currentWorkout.exercises.length} exercises)
                  </h3>
                  <div className="space-y-3">
                    {currentWorkout.exercises.map((workoutInfo, index) => (
                      <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{workoutInfo.exercise.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                {workoutInfo.sets} sets
                              </span>
                              {workoutInfo.reps && (
                                <span>{workoutInfo.reps} reps</span>
                              )}
                              {workoutInfo.weight && (
                                <span className="flex items-center gap-1">
                                  <Weight className="w-3 h-3" />
                                  {workoutInfo.weight}kg
                                </span>
                              )}
                              {workoutInfo.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {workoutInfo.duration}min
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-3 h-3" />
                                {workoutInfo.calories} cal
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeExerciseFromWorkout(index)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Workout Summary */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-white/60 text-sm">Total Exercises</p>
                        <p className="text-white font-bold text-lg">{currentWorkout.exercises.length}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Est. Calories</p>
                        <p className="text-orange-400 font-bold text-lg">
                          {currentWorkout.exercises.reduce((sum, ex) => sum + (ex.calories || 0), 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Est. Duration</p>
                        <p className="text-white font-bold text-lg">
                          {formatTime(currentWorkout.exercises.reduce((sum, ex) => {
                            if (ex.duration) return sum + ex.duration;
                            if (ex.sets && ex.reps) {
                              return sum + (ex.sets * ex.reps * 3 + (ex.sets - 1) * (ex.restTime || 60)) / 60;
                            }
                            return sum + 5;
                          }, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-white font-medium mb-2">Workout Notes (optional)</label>
                <textarea
                  value={currentWorkout.notes}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes about this workout session..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  onClick={saveWorkoutSession}
                  disabled={saving || !currentWorkout.session_name.trim() || currentWorkout.exercises.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Workout
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowWorkoutBuilder(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Sessions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              Your Workouts ({workoutSessions.length})
            </h2>
          </div>
          
          {workoutSessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No workouts found</h3>
              <p className="text-white/60 max-w-md mx-auto">
                Create your first workout session to start tracking your fitness progress!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workoutSessions.map((session) => (
                <div key={session.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden hover-lift">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white text-lg">{session.session_name}</h3>
                      <button
                        onClick={() => deleteWorkoutSession(session.id)}
                        disabled={deleting === session.id}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        {deleting === session.id ? (
                          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-white/60 text-xs">Exercises</p>
                          <p className="text-white font-semibold">{session.exercises?.length || 0}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-white/60 text-xs">Duration</p>
                          <p className="text-white font-semibold">{formatTime(session.total_duration)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-white/60 text-xs">Calories</p>
                          <p className="text-orange-400 font-semibold">{session.total_calories}</p>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <p className="text-white/70 text-sm">{session.notes}</p>
                      )}
                      
                      <div className="text-white/60 text-xs">
                        Created: {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumWorkouts;