import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, Plus, Target, Flame, Clock, Calendar, Upload, X, Save, 
  TrendingUp, Coffee, Sunrise, Sun, Moon, Search, Filter, Image
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

const Meals: React.FC = () => {
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
    { value: 'breakfast', label: 'Breakfast', icon: Sunrise, color: '#ffeaa7', time: '08:00' },
    { value: 'lunch', label: 'Lunch', icon: Sun, color: '#fdcb6e', time: '12:00' },
    { value: 'dinner', label: 'Dinner', icon: Moon, color: '#e17055', time: '19:00' },
    { value: 'snack', label: 'Snack', icon: Coffee, color: '#a29bfe', time: '15:00' }
  ];

  const commonFoods = [
    { name: 'Chicken Breast (100g)', calories: 165 },
    { name: 'Brown Rice (1 cup)', calories: 216 },
    { name: 'Salmon (100g)', calories: 208 },
    { name: 'Avocado (1 medium)', calories: 234 },
    { name: 'Greek Yogurt (1 cup)', calories: 130 },
    { name: 'Banana (1 medium)', calories: 105 },
    { name: 'Oatmeal (1 cup)', calories: 147 },
    { name: 'Eggs (2 large)', calories: 155 }
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

  const setMealTime = (mealType: string, defaultTime: string) => {
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

  const getMealTimeIcon = (mealTime: string) => {
    const hour = new Date(mealTime).getHours();
    if (hour >= 5 && hour < 11) return { icon: Sunrise, color: '#ffeaa7', name: 'Breakfast' };
    if (hour >= 11 && hour < 16) return { icon: Sun, color: '#fdcb6e', name: 'Lunch' };
    if (hour >= 16 && hour < 22) return { icon: Moon, color: '#e17055', name: 'Dinner' };
    return { icon: Coffee, color: '#a29bfe', name: 'Snack' };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3 text-muted">Loading your meals...</div>
        </div>
      </div>
    );
  }

  const dayStats = getDayStats();
  const calorieProgress = (dayStats.totalCalories / dailyGoals.calorie_goal) * 100;

  return (
    <div>
      {/* Header with Date Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Meal Tracking</h4>
          <p className="text-muted mb-0">Track your nutrition and reach your goals</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ maxWidth: '150px' }}
          />
          <button 
            className="btn btn-warning d-flex align-items-center"
            onClick={() => setShowForm(true)}
            style={{ borderRadius: '12px' }}
          >
            <Plus size={18} className="me-2" />
            Log Meal
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-0">Daily Calorie Goal</h5>
                  <small className="text-muted">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </small>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold mb-0" style={{ color: calorieProgress > 100 ? '#e17055' : '#00b894' }}>
                    {dayStats.totalCalories} / {dailyGoals.calorie_goal}
                  </h4>
                  <small className="text-muted">{Math.round(calorieProgress)}% of goal</small>
                </div>
              </div>
              
              <div className="progress mb-3" style={{ height: '12px', borderRadius: '10px' }}>
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${Math.min(calorieProgress, 100)}%`,
                    background: calorieProgress > 100 
                      ? 'linear-gradient(90deg, #e17055, #ff7675)' 
                      : 'linear-gradient(90deg, #00b894, #55efc4)',
                    borderRadius: '10px'
                  }}
                ></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  {dayStats.mealCount} meals logged today
                </span>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    const newCalorieGoal = prompt('Set your daily calorie goal:', dailyGoals.calorie_goal.toString());
                    if (newCalorieGoal && !isNaN(parseInt(newCalorieGoal))) {
                      updateDailyGoals({
                        ...dailyGoals,
                        calorie_goal: parseInt(newCalorieGoal)
                      });
                    }
                  }}
                >
                  <Target size={14} className="me-1" />
                  Adjust Goal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#fd79a820' }}>
                <TrendingUp size={28} style={{ color: '#fd79a8' }} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Nutrition Goal</h5>
              <p className="text-muted small mb-0">
                {calorieProgress > 100 
                  ? `${Math.round(calorieProgress - 100)}% over goal` 
                  : `${Math.round(100 - calorieProgress)}% remaining`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Meal Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-warning text-dark" style={{ borderRadius: '16px 16px 0 0' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Log New Meal
              </h5>
              <button 
                className="btn btn-sm btn-outline-dark"
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label fw-medium">Meal Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Grilled Chicken Salad, Protein Smoothie..."
                    value={newMeal.meal_name}
                    onChange={(e) => setNewMeal({...newMeal, meal_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-medium">Calories</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="350"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Description (optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Ingredients, preparation method, or notes..."
                value={newMeal.description}
                onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
              />
            </div>

            {/* Quick Fill Options */}
            <div className="mb-3">
              <label className="form-label fw-medium">Quick Fill</label>
              <div className="d-flex flex-wrap gap-2">
                {commonFoods.slice(0, 4).map(food => (
                  <button
                    key={food.name}
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => quickFillMeal(food)}
                  >
                    {food.name.split('(')[0]} ({food.calories} cal)
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-3">
              <label className="form-label fw-medium">Meal Photo (optional)</label>
              <div className="row">
                <div className="col-md-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                  />
                  <small className="text-muted">Upload a photo of your meal</small>
                </div>
                {photoPreview && (
                  <div className="col-md-4">
                    <div className="position-relative">
                      <img
                        src={photoPreview}
                        alt="Meal preview"
                        className="img-thumbnail"
                        style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        style={{ transform: 'translate(25%, -25%)' }}
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="form-label fw-medium">Meal Time</label>
              <div className="row">
                <div className="col-md-6">
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={newMeal.meal_time}
                    onChange={(e) => setNewMeal({...newMeal, meal_time: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={setCurrentTime}
                    >
                      Now
                    </button>
                    {mealTimes.slice(0, 3).map(mealTime => (
                      <button
                        key={mealTime.value}
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setMealTime(mealTime.value, mealTime.time)}
                      >
                        {mealTime.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-warning"
                onClick={saveMeal}
                disabled={saving || !newMeal.meal_name.trim()}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Logging Meal...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Log Meal
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={mealTimeFilter}
            onChange={(e) => setMealTimeFilter(e.target.value as any)}
          >
            <option value="all">All Meal Times</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snacks</option>
          </select>
        </div>
      </div>

      {/* Meals List */}
      <div className="row">
        {filteredMeals.length === 0 ? (
          <div className="col-12 text-center py-5">
            <Camera size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No meals found</h5>
            <p className="text-muted">
              {searchTerm || mealTimeFilter !== 'all' 
                ? "No meals match your search criteria."
                : "Log your first meal above!"
              }
            </p>
          </div>
        ) : (
          filteredMeals.map((meal) => {
            const mealTimeInfo = getMealTimeIcon(meal.meal_time);
            const MealIcon = mealTimeInfo.icon;
            
            return (
              <div key={meal.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  {meal.photo_path && (
                    <div className="position-relative">
                      <img
                        src={`http://localhost:5001/uploads/${meal.photo_path}`}
                        alt={meal.meal_name}
                        className="card-img-top"
                        style={{ 
                          height: '180px', 
                          objectFit: 'cover',
                          borderRadius: '16px 16px 0 0'
                        }}
                      />
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="badge text-dark" style={{ backgroundColor: mealTimeInfo.color }}>
                          {meal.calories} cal
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                           style={{ 
                             width: '36px', 
                             height: '36px', 
                             backgroundColor: `${mealTimeInfo.color}20` 
                           }}>
                        <MealIcon size={18} style={{ color: mealTimeInfo.color }} />
                      </div>
                      <div>
                        <div className="small fw-medium text-muted">{mealTimeInfo.name}</div>
                        <div className="small text-muted">
                          <Clock size={12} className="me-1" />
                          {formatTime(meal.meal_time)}
                        </div>
                      </div>
                    </div>
                    
                    {!meal.photo_path && (
                      <span className="badge bg-warning text-dark">
                        <Flame size={12} className="me-1" />
                        {meal.calories} cal
                      </span>
                    )}
                  </div>
                  
                  <div className="card-body pt-0">
                    <h6 className="fw-bold mb-2">{meal.meal_name}</h6>
                    {meal.description && (
                      <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {meal.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Meals;