import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Plus, CheckCircle, Calendar, Timer, Flame, Save, X, TrendingUp, Target, Award, Activity, Search } from 'lucide-react';

interface Workout {
  id: number;
  name: string;
  description: string;
  target_date: string;
  completed: boolean;
  completion_date: string | null;
  duration: number | null;
  calories_burned: number | null;
  notes: string | null;
  created_at: string;
}

const PremiumWorkouts: React.FC = () => {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
  const [newWorkoutDate, setNewWorkoutDate] = useState('');
  
  // Completion form states
  const [completingWorkout, setCompletingWorkout] = useState<number | null>(null);
  const [completionDuration, setCompletionDuration] = useState('');
  const [completionCalories, setCompletionCalories] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Filter states
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const workoutTypes = [
    // Cardio
    { name: 'Running', emoji: '🏃', color: 'from-blue-500 to-cyan-600', category: 'Cardio' },
    { name: 'Cycling', emoji: '🚴‍♂️', color: 'from-green-500 to-emerald-600', category: 'Cardio' },
    { name: 'Swimming', emoji: '🏊‍♂️', color: 'from-teal-500 to-blue-600', category: 'Cardio' },
    { name: 'Walking', emoji: '🚶‍♂️', color: 'from-slate-500 to-gray-600', category: 'Cardio' },
    { name: 'HIIT', emoji: '🔥', color: 'from-red-500 to-orange-600', category: 'Cardio' },
    { name: 'Elliptical', emoji: '🎯', color: 'from-blue-400 to-cyan-500', category: 'Cardio' },
    { name: 'Rowing', emoji: '🚣', color: 'from-cyan-600 to-blue-600', category: 'Cardio' },
    { name: 'Stair Climbing', emoji: '🪜', color: 'from-indigo-500 to-purple-600', category: 'Cardio' },
    
    // Strength Training
    { name: 'Weight Lifting', emoji: '🏋️‍♂️', color: 'from-orange-500 to-amber-600', category: 'Strength' },
    { name: 'Bodyweight', emoji: '💪', color: 'from-red-500 to-orange-600', category: 'Strength' },
    { name: 'Push Day', emoji: '⬆️', color: 'from-orange-600 to-red-600', category: 'Strength' },
    { name: 'Pull Day', emoji: '⬇️', color: 'from-amber-600 to-orange-600', category: 'Strength' },
    { name: 'Leg Day', emoji: '🦵', color: 'from-red-600 to-pink-600', category: 'Strength' },
    { name: 'Core Training', emoji: '🎯', color: 'from-yellow-500 to-orange-500', category: 'Strength' },
    { name: 'Resistance Bands', emoji: '🎗️', color: 'from-pink-500 to-red-500', category: 'Strength' },
    { name: 'Kettlebell', emoji: '🔔', color: 'from-gray-600 to-gray-700', category: 'Strength' },
    
    // Sports
    { name: 'Soccer', emoji: '⚽', color: 'from-green-500 to-emerald-600', category: 'Sports' },
    { name: 'Basketball', emoji: '🏀', color: 'from-orange-500 to-red-600', category: 'Sports' },
    { name: 'Boxing', emoji: '🥊', color: 'from-red-500 to-pink-600', category: 'Sports' },
    { name: 'Tennis', emoji: '🎾', color: 'from-yellow-500 to-green-500', category: 'Sports' },
    { name: 'Volleyball', emoji: '🏐', color: 'from-blue-500 to-purple-600', category: 'Sports' },
    { name: 'Badminton', emoji: '🏸', color: 'from-indigo-500 to-blue-600', category: 'Sports' },
    { name: 'Martial Arts', emoji: '🥋', color: 'from-purple-600 to-indigo-600', category: 'Sports' },
    { name: 'Rock Climbing', emoji: '🧗‍♂️', color: 'from-stone-500 to-gray-600', category: 'Sports' },
    
    // Flexibility & Recovery
    { name: 'Yoga', emoji: '🧘‍♀️', color: 'from-purple-500 to-indigo-600', category: 'Flexibility' },
    { name: 'Pilates', emoji: '🤸‍♀️', color: 'from-pink-500 to-rose-600', category: 'Flexibility' },
    { name: 'Stretching', emoji: '🤸', color: 'from-green-400 to-teal-500', category: 'Flexibility' },
    { name: 'Meditation', emoji: '🧘', color: 'from-indigo-400 to-purple-500', category: 'Flexibility' },
    { name: 'Foam Rolling', emoji: '📏', color: 'from-gray-500 to-slate-600', category: 'Flexibility' },
    
    // Fun Activities
    { name: 'Dancing', emoji: '💃', color: 'from-purple-500 to-pink-600', category: 'Fun' },
    { name: 'Hiking', emoji: '🥾', color: 'from-green-600 to-emerald-700', category: 'Fun' },
    { name: 'CrossFit', emoji: '⚡', color: 'from-yellow-500 to-orange-600', category: 'Fun' }
  ];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:5001/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async () => {
    if (!newWorkoutName.trim() || !newWorkoutDate) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/workouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newWorkoutName,
          description: newWorkoutDescription,
          target_date: newWorkoutDate
        })
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchWorkouts();
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const completeWorkout = async (workoutId: number) => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5001/workouts/${workoutId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration: parseInt(completionDuration) || null,
          calories_burned: parseInt(completionCalories) || null,
          notes: completionNotes || null
        })
      });

      if (response.ok) {
        setCompletingWorkout(null);
        setCompletionDuration('');
        setCompletionCalories('');
        setCompletionNotes('');
        fetchWorkouts();
      }
    } catch (error) {
      console.error('Error completing workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewWorkoutName('');
    setNewWorkoutDescription('');
    setNewWorkoutDate('');
  };

  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (showForm && !newWorkoutDate) {
      setNewWorkoutDate(getDefaultDate());
    }
  }, [showForm]);

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && !workout.completed) ||
                         (filter === 'completed' && workout.completed);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (targetDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(targetDate) < new Date();
  };

  const getWorkoutStats = () => {
    const completed = workouts.filter(w => w.completed);
    const totalCalories = completed.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);
    const thisWeekCompleted = completed.filter(w => {
      const completionDate = new Date(w.completion_date || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completionDate >= weekAgo;
    }).length;

    return {
      totalCompleted: completed.length,
      totalCalories,
      totalDuration,
      thisWeekCompleted,
      pending: workouts.filter(w => !w.completed).length
    };
  };

  const getWorkoutEmoji = (name: string) => {
    const type = workoutTypes.find(t => name.toLowerCase().includes(t.name.toLowerCase()));
    return type?.emoji || '🏋️‍♂️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  const stats = getWorkoutStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Fitness Journey</h1>
              <p className="text-white/70">Track your workouts and achieve your goals</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalCompleted}</h3>
            <p className="text-white/60 text-sm">Completed</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{stats.pending}</h3>
            <p className="text-white/60 text-sm">Pending</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalCalories}</h3>
            <p className="text-white/60 text-sm">Calories Burned</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{stats.thisWeekCompleted}</h3>
            <p className="text-white/60 text-sm">This Week</p>
          </div>
        </div>

        {/* Add Workout Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3 hover-lift"
          >
            <Plus className="w-5 h-5" />
            Plan New Workout
          </button>
        </div>

        {/* New Workout Form */}
        {showForm && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Plan New Workout</h2>
                  <p className="text-white/60">Set your fitness goals and schedule</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Workout Name</label>
                  <input
                    type="text"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                    placeholder="e.g., Morning Cardio, Upper Body Strength..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newWorkoutDate}
                    onChange={(e) => setNewWorkoutDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newWorkoutDescription}
                  onChange={(e) => setNewWorkoutDescription(e.target.value)}
                  placeholder="Describe your workout plan, exercises, or goals..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-3">Exercise Catalogue</label>
                <div className="space-y-6">
                  {['Cardio', 'Strength', 'Sports', 'Flexibility', 'Fun'].map(category => {
                    const categoryWorkouts = workoutTypes.filter(type => type.category === category);
                    return (
                      <div key={category}>
                        <h4 className="text-white/80 font-semibold mb-3 text-sm uppercase tracking-wider">{category}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {categoryWorkouts.map(type => (
                            <button
                              key={type.name}
                              type="button"
                              onClick={() => setNewWorkoutName(type.name)}
                              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex flex-col items-center gap-2 text-center hover-lift"
                            >
                              <span className="text-2xl">{type.emoji}</span>
                              <span className="text-white/80 text-xs font-medium">{type.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveWorkout}
                  disabled={saving || !newWorkoutName.trim() || !newWorkoutDate}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
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
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: workouts.length },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'completed', label: 'Completed', count: stats.totalCompleted }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-emerald-400" />
              Your Workouts ({filteredWorkouts.length})
            </h2>
          </div>
          
          {filteredWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No workouts found</h3>
              <p className="text-white/60 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : filter === 'all' 
                    ? 'Plan your first workout to start your fitness journey!'
                    : `No ${filter} workouts at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredWorkouts.map((workout) => {
                const overdue = isOverdue(workout.target_date, workout.completed);
                const isCompleting = completingWorkout === workout.id;
                const emoji = getWorkoutEmoji(workout.name);
                
                return (
                  <div key={workout.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-xl">{emoji}</span>
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg ${workout.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                            {workout.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(workout.target_date)}
                            {overdue && !workout.completed && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!workout.completed && !isCompleting && (
                        <button
                          onClick={() => setCompletingWorkout(workout.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                    </div>

                    {workout.description && (
                      <p className="text-white/80 mb-4 leading-relaxed">
                        {workout.description}
                      </p>
                    )}

                    {/* Completion Form */}
                    {isCompleting && (
                      <div className="bg-white/10 rounded-xl p-4 mb-4 space-y-4">
                        <h4 className="font-bold text-white">Complete Workout</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">Duration (minutes)</label>
                            <input
                              type="number"
                              value={completionDuration}
                              onChange={(e) => setCompletionDuration(e.target.value)}
                              placeholder="30"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">Calories Burned</label>
                            <input
                              type="number"
                              value={completionCalories}
                              onChange={(e) => setCompletionCalories(e.target.value)}
                              placeholder="300"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">Notes</label>
                          <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="How did it go? Any achievements or challenges?"
                            rows={2}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => completeWorkout(workout.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            {saving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Complete
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setCompletingWorkout(null)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Completion Info */}
                    {workout.completed && (
                      <div className="bg-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-emerald-400" />
                            <span className="font-medium text-emerald-400">Completed</span>
                          </div>
                          <span className="text-white/60 text-sm">
                            {formatDateTime(workout.completion_date || '')}
                          </span>
                        </div>
                        
                        {(workout.duration || workout.calories_burned) && (
                          <div className="flex gap-4 mb-3">
                            {workout.duration && (
                              <div className="flex items-center gap-1 text-white/80">
                                <Timer className="w-4 h-4" />
                                <span className="text-sm">{workout.duration} min</span>
                              </div>
                            )}
                            {workout.calories_burned && (
                              <div className="flex items-center gap-1 text-white/80">
                                <Flame className="w-4 h-4" />
                                <span className="text-sm">{workout.calories_burned} cal</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {workout.notes && (
                          <p className="text-white/80 text-sm italic">
                            "{workout.notes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumWorkouts;