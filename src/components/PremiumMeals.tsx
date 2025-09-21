import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, Plus, Target, Flame, Clock, X, Save, 
  TrendingUp, Coffee, Sunrise, Sun, Moon, Search,
  UtensilsCrossed, Award, ChefHat, Apple
} from 'lucide-react';

interface Meal {
  id: number;
  meal_name: string;
  description: string;
  calories: number;
  photo_path: string | null;
  meal_time: string;
  created_at: string;
}

interface DailyGoals {
  calorie_goal: number;
  water_goal: number;
  exercise_goal: string;
}

const PremiumMeals: React.FC = () => {
  const { token } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calorie_goal: 2000,
    water_goal: 8,
    exercise_goal: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    meal_name: '',
    description: '',
    calories: '',
    meal_time: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealTimeFilter, setMealTimeFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mealTimes = [
    { value: 'breakfast', label: 'Breakfast', icon: Sunrise, color: 'from-yellow-400 to-orange-500', emoji: '🌅', time: '08:00' },
    { value: 'lunch', label: 'Lunch', icon: Sun, color: 'from-orange-400 to-red-500', emoji: '☀️', time: '12:00' },
    { value: 'dinner', label: 'Dinner', icon: Moon, color: 'from-blue-500 to-purple-600', emoji: '🌙', time: '19:00' },
    { value: 'snack', label: 'Snack', icon: Coffee, color: 'from-purple-400 to-pink-500', emoji: '☕', time: '15:00' }
  ];

  const commonFoods = [
    { name: 'Chicken Breast', calories: 165, emoji: '🍗' },
    { name: 'Brown Rice', calories: 216, emoji: '🍚' },
    { name: 'Salmon', calories: 208, emoji: '🐟' },
    { name: 'Avocado', calories: 234, emoji: '🥑' },
    { name: 'Greek Yogurt', calories: 130, emoji: '🥛' },
    { name: 'Banana', calories: 105, emoji: '🍌' },
    { name: 'Oatmeal', calories: 147, emoji: '🥣' },
    { name: 'Eggs', calories: 155, emoji: '🥚' }
  ];

  useEffect(() => {
    fetchMeals();
    fetchDailyGoals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      const response = await fetch('http://localhost:5001/meals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyGoals = async () => {
    try {
      const response = await fetch(`http://localhost:5001/goals/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.calorie_goal) {
          setDailyGoals(data);
        }
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMeal = async () => {
    if (!newMeal.meal_name.trim()) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('meal_name', newMeal.meal_name);
      formData.append('description', newMeal.description);
      formData.append('calories', newMeal.calories);
      formData.append('meal_time', newMeal.meal_time || new Date().toISOString());
      
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      const response = await fetch('http://localhost:5001/meals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchMeals();
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateDailyGoals = async (newGoals: DailyGoals) => {
    try {
      const response = await fetch('http://localhost:5001/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal_date: selectedDate,
          ...newGoals
        })
      });

      if (response.ok) {
        setDailyGoals(newGoals);
      }
    } catch (error) {
      console.error('Error updating daily goals:', error);
    }
  };

  const resetForm = () => {
    setNewMeal({
      meal_name: '',
      description: '',
      calories: '',
      meal_time: ''
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const quickFillMeal = (food: { name: string; calories: number }) => {
    setNewMeal({
      ...newMeal,
      meal_name: food.name,
      calories: food.calories.toString()
    });
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dateTimeString = `${selectedDate}T${timeString}`;
    setNewMeal({
      ...newMeal,
      meal_time: dateTimeString
    });
  };

  const setMealTime = (_mealType: string, defaultTime: string) => {
    const dateTimeString = `${selectedDate}T${defaultTime}`;
    setNewMeal({
      ...newMeal,
      meal_time: dateTimeString
    });
  };

  const filteredMeals = meals.filter(meal => {
    const mealDate = new Date(meal.meal_time).toISOString().split('T')[0];
    const matchesDate = mealDate === selectedDate;
    const matchesSearch = meal.meal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesMealTime = true;
    if (mealTimeFilter !== 'all') {
      const mealHour = new Date(meal.meal_time).getHours();
      switch (mealTimeFilter) {
        case 'breakfast':
          matchesMealTime = mealHour >= 5 && mealHour < 11;
          break;
        case 'lunch':
          matchesMealTime = mealHour >= 11 && mealHour < 16;
          break;
        case 'dinner':
          matchesMealTime = mealHour >= 16 && mealHour < 22;
          break;
        case 'snack':
          matchesMealTime = mealHour >= 22 || mealHour < 5 || (mealHour >= 14 && mealHour < 16);
          break;
      }
    }
    
    return matchesDate && matchesSearch && matchesMealTime;
  });

  const getDayStats = () => {
    const dayMeals = meals.filter(meal => 
      new Date(meal.meal_time).toISOString().split('T')[0] === selectedDate
    );
    
    const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const mealCount = dayMeals.length;
    
    return { totalCalories, mealCount };
  };

  const getMealTimeInfo = (mealTime: string) => {
    const hour = new Date(mealTime).getHours();
    if (hour >= 5 && hour < 11) return mealTimes[0]; // Breakfast
    if (hour >= 11 && hour < 16) return mealTimes[1]; // Lunch
    if (hour >= 16 && hour < 22) return mealTimes[2]; // Dinner
    return mealTimes[3]; // Snack
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your nutrition...</p>
        </div>
      </div>
    );
  }

  const dayStats = getDayStats();
  const calorieProgress = (dayStats.totalCalories / dailyGoals.calorie_goal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Nutrition Tracker</h1>
              <p className="text-white/70">Track your meals and reach your calorie goals</p>
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
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-white/70">{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calorie Progress */}
          <div className="lg:col-span-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Daily Calories</h2>
                  <p className="text-white/60">Track your energy intake</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newCalorieGoal = prompt('Set your daily calorie goal:', dailyGoals.calorie_goal.toString());
                  if (newCalorieGoal && !isNaN(parseInt(newCalorieGoal))) {
                    updateDailyGoals({
                      ...dailyGoals,
                      calorie_goal: parseInt(newCalorieGoal)
                    });
                  }
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Adjust Goal
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-white mb-2">
                <span className="font-medium">{dayStats.totalCalories} cal consumed</span>
                <span className="text-white/70">{dailyGoals.calorie_goal} cal goal</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    calorieProgress > 100 
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600'
                  }`}
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-sm mt-2">
                {Math.round(calorieProgress)}% of goal • {dayStats.mealCount} meals logged
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Remaining</p>
                <p className="text-white font-bold text-lg">
                  {Math.max(0, dailyGoals.calorie_goal - dayStats.totalCalories)} cal
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Progress</p>
                <p className="text-white font-bold text-lg">{Math.round(calorieProgress)}%</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Meals Today</p>
                <p className="text-white font-bold text-lg">{dayStats.mealCount}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nutrition Status</h3>
            <p className="text-white/60 mb-4">
              {calorieProgress > 100 
                ? `${Math.round(calorieProgress - 100)}% over goal`
                : `${Math.round(100 - calorieProgress)}% remaining`
              }
            </p>
            <div className="space-y-2">
              {calorieProgress >= 90 && (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Goal almost reached!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Meal Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3 hover-lift"
          >
            <Plus className="w-5 h-5" />
            Log New Meal
          </button>
        </div>

        {/* New Meal Form */}
        {showForm && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Log New Meal</h2>
                  <p className="text-white/60">Add details about your meal</p>
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
                  <label className="block text-white font-medium mb-2">Meal Name *</label>
                  <input
                    type="text"
                    value={newMeal.meal_name}
                    onChange={(e) => setNewMeal({...newMeal, meal_name: e.target.value})}
                    placeholder="e.g., Grilled Chicken Salad, Protein Smoothie..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Calories</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                    placeholder="350"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
                  placeholder="Ingredients, preparation method, or notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Quick Fill Options */}
              <div>
                <label className="block text-white font-medium mb-3">Quick Fill</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {commonFoods.map(food => (
                    <button
                      key={food.name}
                      type="button"
                      onClick={() => quickFillMeal(food)}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex flex-col items-center gap-2 text-center"
                    >
                      <span className="text-2xl">{food.emoji}</span>
                      <div>
                        <span className="text-white/80 text-sm font-medium block">{food.name}</span>
                        <span className="text-white/60 text-xs">{food.calories} cal</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-white font-medium mb-2">Meal Photo (optional)</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-white/60 text-sm mt-1">Upload a photo of your meal</p>
                  </div>
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Meal preview"
                        className="w-24 h-24 object-cover rounded-xl border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-white font-medium mb-3">Meal Time</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={newMeal.meal_time}
                    onChange={(e) => setNewMeal({...newMeal, meal_time: e.target.value})}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={setCurrentTime}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Now
                    </button>
                    {mealTimes.slice(0, 3).map(mealTime => (
                      <button
                        key={mealTime.value}
                        type="button"
                        onClick={() => setMealTime(mealTime.value, mealTime.time)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                      >
                        {mealTime.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveMeal}
                  disabled={saving || !newMeal.meal_name.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Log Meal
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
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', emoji: '🍽️' },
              { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
              { key: 'lunch', label: 'Lunch', emoji: '☀️' },
              { key: 'dinner', label: 'Dinner', emoji: '🌙' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setMealTimeFilter(filterOption.key as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  mealTimeFilter === filterOption.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{filterOption.emoji}</span>
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Apple className="w-6 h-6 text-orange-400" />
              Your Meals ({filteredMeals.length})
            </h2>
          </div>
          
          {filteredMeals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No meals found</h3>
              <p className="text-white/60 max-w-md mx-auto">
                {searchTerm || mealTimeFilter !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Log your first meal to start tracking your nutrition!'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.map((meal) => {
                const mealTimeInfo = getMealTimeInfo(meal.meal_time);
                
                return (
                  <div key={meal.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden hover-lift">
                    {meal.photo_path && (
                      <div className="relative h-48">
                        <img
                          src={`http://localhost:5001/uploads/${meal.photo_path}`}
                          alt={meal.meal_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                            <Flame className="w-3 h-3 inline mr-1" />
                            {meal.calories} cal
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${mealTimeInfo.color} flex items-center justify-center`}>
                            <span className="text-lg">{mealTimeInfo.emoji}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {!meal.photo_path && (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${mealTimeInfo.color} flex items-center justify-center`}>
                              <span className="text-lg">{mealTimeInfo.emoji}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white/80 text-sm font-medium">{mealTimeInfo.label}</span>
                            <div className="flex items-center gap-1 text-white/60 text-xs">
                              <Clock className="w-3 h-3" />
                              {formatTime(meal.meal_time)}
                            </div>
                          </div>
                        </div>
                        
                        {!meal.photo_path && (
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                            <Flame className="w-3 h-3 inline mr-1" />
                            {meal.calories} cal
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-white text-lg mb-2">{meal.meal_name}</h3>
                      {meal.description && (
                        <p className="text-white/70 text-sm leading-relaxed">
                          {meal.description}
                        </p>
                      )}
                    </div>
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

export default PremiumMeals;