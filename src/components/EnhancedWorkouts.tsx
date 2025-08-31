import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Dumbbell, Plus, Clock, CheckCircle, Calendar, Target, Timer, Flame, Edit, Save, X, 
  TrendingUp, Repeat, Bell, PlayCircle, Trash2, GripVertical, Activity 
} from 'lucide-react';

interface Exercise {
  id?: number;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  order_index: number;
}

interface Workout {
  id: number;
  name: string;
  description: string;
  target_date: string;
  target_time?: string;
  recurring_type: string;
  recurring_days?: string;
  completed: boolean;
  completion_date: string | null;
  duration: number | null;
  calories_burned: number | null;
  notes: string | null;
  reminder_enabled: boolean;
  reminder_minutes: number;
  created_at: string;
  exercises: Exercise[];
}

const EnhancedWorkouts: React.FC = () => {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    target_date: '',
    target_time: '',
    recurring_type: 'none',
    recurring_days: '',
    reminder_enabled: true,
    reminder_minutes: 15
  });
  
  // Exercise management
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState<Exercise>({
    exercise_name: '',
    sets: undefined,
    reps: undefined,
    weight: undefined,
    duration: undefined,
    distance: undefined,
    notes: '',
    order_index: 0
  });
  
  // Completion form states
  const [completingWorkout, setCompletingWorkout] = useState<number | null>(null);
  const [completionDuration, setCompletionDuration] = useState('');
  const [completionCalories, setCompletionCalories] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Filter and view states
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const recurringOptions = [
    { value: 'none', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom Days' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const commonExercises = [
    'Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Plank', 'Burpees',
    'Deadlift', 'Bench Press', 'Shoulder Press', 'Bicep Curls',
    'Tricep Dips', 'Mountain Climbers', 'Running', 'Cycling',
    'Jumping Jacks', 'Russian Twists', 'Leg Raises', 'Wall Sit'
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
    if (!newWorkout.name.trim() || !newWorkout.target_date) return;
    
    setSaving(true);
    try {
      const workoutData = {
        ...newWorkout,
        exercises: exercises
      };

      const response = await fetch('http://localhost:5001/workouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchWorkouts();
        
        // Create reminder if enabled
        if (newWorkout.reminder_enabled && newWorkout.target_time) {
          await createWorkoutReminder();
        }
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const createWorkoutReminder = async () => {
    try {
      const reminderDateTime = new Date(`${newWorkout.target_date}T${newWorkout.target_time}`);
      reminderDateTime.setMinutes(reminderDateTime.getMinutes() - newWorkout.reminder_minutes);

      await fetch('http://localhost:5001/reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Workout Reminder: ${newWorkout.name}`,
          description: `Your workout "${newWorkout.name}" is scheduled in ${newWorkout.reminder_minutes} minutes.`,
          reminder_date: reminderDateTime.toISOString()
        })
      });
    } catch (error) {
      console.error('Error creating workout reminder:', error);
    }
  };

  const addExercise = () => {
    if (!newExercise.exercise_name.trim()) return;
    
    setExercises([...exercises, { ...newExercise, order_index: exercises.length }]);
    setNewExercise({
      exercise_name: '',
      sets: undefined,
      reps: undefined,
      weight: undefined,
      duration: undefined,
      distance: undefined,
      notes: '',
      order_index: 0
    });
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
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
    setNewWorkout({
      name: '',
      description: '',
      target_date: '',
      target_time: '',
      recurring_type: 'none',
      recurring_days: '',
      reminder_enabled: true,
      reminder_minutes: 15
    });
    setExercises([]);
  };

  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDefaultTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.ceil(now.getMinutes() / 15) * 15).padStart(2, '0');
    return `${hours}:${minutes === '60' ? '00' : minutes}`;
  };

  useEffect(() => {
    if (showForm && !newWorkout.target_date) {
      setNewWorkout(prev => ({
        ...prev,
        target_date: getDefaultDate(),
        target_time: getDefaultTime()
      }));
    }
  }, [showForm]);

  const filteredWorkouts = workouts.filter(workout => {
    switch (filter) {
      case 'pending':
        return !workout.completed;
      case 'completed':
        return workout.completed;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecurringDaysDisplay = (recurringType: string, recurringDays: string) => {
    if (recurringType === 'daily') return 'Every day';
    if (recurringType === 'weekly') return 'Weekly';
    if (recurringType === 'custom' && recurringDays) {
      const days = recurringDays.split(',').map(day => 
        daysOfWeek.find(d => d.value === day)?.label
      ).filter(Boolean);
      return days.join(', ');
    }
    return 'One-time';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3 text-muted">Loading your workouts...</div>
        </div>
      </div>
    );
  }

  const stats = {
    totalCompleted: workouts.filter(w => w.completed).length,
    pendingCount: workouts.filter(w => !w.completed).length,
    totalCalories: workouts.filter(w => w.completed).reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    thisWeekCompleted: workouts.filter(w => {
      if (!w.completed || !w.completion_date) return false;
      const completionDate = new Date(w.completion_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completionDate >= weekAgo;
    }).length
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#43e97b20' }}>
                <CheckCircle size={28} style={{ color: '#43e97b' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.totalCompleted}</h3>
              <p className="text-muted mb-0">Completed</p>
              <small className="text-muted">All time</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#4facfe20' }}>
                <Clock size={28} style={{ color: '#4facfe' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.pendingCount}</h3>
              <p className="text-muted mb-0">Pending</p>
              <small className="text-muted">To complete</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#ff6b6b20' }}>
                <Flame size={28} style={{ color: '#ff6b6b' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.totalCalories}</h3>
              <p className="text-muted mb-0">Calories Burned</p>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: '60px', height: '60px', backgroundColor: '#ffeaa720' }}>
                <TrendingUp size={28} style={{ color: '#ffeaa7' }} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.thisWeekCompleted}</h3>
              <p className="text-muted mb-0">This Week</p>
              <small className="text-muted">Workouts done</small>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Workout Schedule</h4>
          <p className="text-muted mb-0">Plan, track, and complete your fitness goals</p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group">
            <button 
              className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button 
              className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
          </div>
          <button 
            className="btn btn-success d-flex align-items-center"
            onClick={() => setShowForm(true)}
            style={{ borderRadius: '12px' }}
          >
            <Plus size={18} className="me-2" />
            New Workout
          </button>
        </div>
      </div>

      {/* Enhanced Workout Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-success text-white" style={{ borderRadius: '16px 16px 0 0' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Create Workout Plan
              </h5>
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body p-4">
            {/* Basic Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-medium">Workout Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Morning Cardio, Upper Body Strength..."
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-medium">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={newWorkout.target_date}
                  onChange={(e) => setNewWorkout({...newWorkout, target_date: e.target.value})}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-medium">Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={newWorkout.target_time}
                  onChange={(e) => setNewWorkout({...newWorkout, target_time: e.target.value})}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe your workout goals or plan..."
                value={newWorkout.description}
                onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
              />
            </div>

            {/* Recurring Settings */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-medium">Repeat Schedule</label>
                <select
                  className="form-select"
                  value={newWorkout.recurring_type}
                  onChange={(e) => setNewWorkout({...newWorkout, recurring_type: e.target.value})}
                >
                  {recurringOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {newWorkout.recurring_type === 'custom' && (
                <div className="col-md-6">
                  <label className="form-label fw-medium">Select Days</label>
                  <div className="d-flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <div key={day.value} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={day.value}
                          checked={newWorkout.recurring_days.includes(day.value)}
                          onChange={(e) => {
                            const days = newWorkout.recurring_days.split(',').filter(Boolean);
                            if (e.target.checked) {
                              days.push(day.value);
                            } else {
                              const index = days.indexOf(day.value);
                              if (index > -1) days.splice(index, 1);
                            }
                            setNewWorkout({...newWorkout, recurring_days: days.join(',')});
                          }}
                        />
                        <label className="form-check-label" htmlFor={day.value}>
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Settings */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="reminder_enabled"
                    checked={newWorkout.reminder_enabled}
                    onChange={(e) => setNewWorkout({...newWorkout, reminder_enabled: e.target.checked})}
                  />
                  <label className="form-check-label fw-medium" htmlFor="reminder_enabled">
                    <Bell size={16} className="me-2" />
                    Enable Workout Reminders
                  </label>
                </div>
              </div>
              {newWorkout.reminder_enabled && (
                <div className="col-md-6">
                  <label className="form-label fw-medium">Reminder Time</label>
                  <select
                    className="form-select"
                    value={newWorkout.reminder_minutes}
                    onChange={(e) => setNewWorkout({...newWorkout, reminder_minutes: parseInt(e.target.value)})}
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                  </select>
                </div>
              )}
            </div>

            {/* Exercises Section */}
            <div className="border-top pt-4">
              <h6 className="fw-bold mb-3">
                <Activity size={20} className="me-2" />
                Exercises ({exercises.length})
              </h6>
              
              {/* Exercise List */}
              {exercises.length > 0 && (
                <div className="mb-4">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="card bg-light mb-2">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{exercise.exercise_name}</h6>
                            <div className="d-flex gap-3 text-muted small">
                              {exercise.sets && <span>{exercise.sets} sets</span>}
                              {exercise.reps && <span>{exercise.reps} reps</span>}
                              {exercise.weight && <span>{exercise.weight} lbs</span>}
                              {exercise.duration && <span>{exercise.duration} min</span>}
                              {exercise.distance && <span>{exercise.distance} km</span>}
                            </div>
                            {exercise.notes && (
                              <p className="small text-muted mb-0 mt-1">{exercise.notes}</p>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeExercise(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Exercise Form */}
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Exercise name"
                        value={newExercise.exercise_name}
                        onChange={(e) => setNewExercise({...newExercise, exercise_name: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex gap-2">
                        {commonExercises.slice(0, 3).map(exercise => (
                          <button
                            key={exercise}
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setNewExercise({...newExercise, exercise_name: exercise})}
                          >
                            {exercise}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Sets"
                        value={newExercise.sets || ''}
                        onChange={(e) => setNewExercise({...newExercise, sets: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                      <small className="text-muted">Sets</small>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Reps"
                        value={newExercise.reps || ''}
                        onChange={(e) => setNewExercise({...newExercise, reps: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                      <small className="text-muted">Reps</small>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Weight"
                        value={newExercise.weight || ''}
                        onChange={(e) => setNewExercise({...newExercise, weight: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                      <small className="text-muted">Weight (lbs)</small>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Duration"
                        value={newExercise.duration || ''}
                        onChange={(e) => setNewExercise({...newExercise, duration: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                      <small className="text-muted">Duration (min)</small>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Distance"
                        value={newExercise.distance || ''}
                        onChange={(e) => setNewExercise({...newExercise, distance: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                      <small className="text-muted">Distance (km)</small>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-success w-100"
                        onClick={addExercise}
                        disabled={!newExercise.exercise_name.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Exercise notes (optional)"
                    value={newExercise.notes}
                    onChange={(e) => setNewExercise({...newExercise, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-success"
                onClick={saveWorkout}
                disabled={saving || !newWorkout.name.trim() || !newWorkout.target_date}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Creating Workout...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Create Workout Plan
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

      {/* Filter Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({workouts.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <Clock size={16} className="me-2" />
            Scheduled ({stats.pendingCount})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <CheckCircle size={16} className="me-2" />
            Completed ({stats.totalCompleted})
          </button>
        </li>
      </ul>

      {/* Workouts Display */}
      <div className="row">
        {filteredWorkouts.length === 0 ? (
          <div className="col-12 text-center py-5">
            <Dumbbell size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No workouts found</h5>
            <p className="text-muted">
              {filter === 'all' 
                ? "Create your first workout plan above!"
                : `No ${filter} workouts at the moment.`
              }
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const isCompleting = completingWorkout === workout.id;
            
            return (
              <div key={workout.id} className="col-lg-6 mb-4">
                <div className={`card border-0 shadow-sm h-100 ${workout.completed ? 'bg-light' : ''}`}
                     style={{ borderRadius: '16px' }}>
                  
                  {/* Workout Header */}
                  <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <div className="rounded-2 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                           style={{ 
                             width: '48px', 
                             height: '48px', 
                             backgroundColor: workout.completed ? '#43e97b20' : '#4facfe20' 
                           }}>
                        {workout.completed ? 
                          <CheckCircle size={24} style={{ color: '#43e97b' }} /> :
                          <Dumbbell size={24} style={{ color: '#4facfe' }} />
                        }
                      </div>
                      <div className="flex-grow-1">
                        <h6 className={`fw-bold mb-1 ${workout.completed ? 'text-muted' : 'text-dark'}`}>
                          {workout.name}
                        </h6>
                        <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
                          <span className="d-flex align-items-center">
                            <Calendar size={12} className="me-1" />
                            {formatDate(workout.target_date)}
                          </span>
                          {workout.target_time && (
                            <span className="d-flex align-items-center">
                              <Clock size={12} className="me-1" />
                              {formatTime(workout.target_time)}
                            </span>
                          )}
                          {workout.recurring_type !== 'none' && (
                            <span className="d-flex align-items-center">
                              <Repeat size={12} className="me-1" />
                              {getRecurringDaysDisplay(workout.recurring_type, workout.recurring_days || '')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!workout.completed && !isCompleting && (
                      <button
                        className="btn btn-sm btn-success flex-shrink-0"
                        onClick={() => setCompletingWorkout(workout.id)}
                      >
                        <PlayCircle size={14} className="me-1" />
                        Start
                      </button>
                    )}
                  </div>
                  
                  <div className="card-body pt-0">
                    {workout.description && (
                      <p className="text-muted mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                        {workout.description}
                      </p>
                    )}

                    {/* Exercise List */}
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-medium mb-2 text-dark">
                          Exercises ({workout.exercises.length})
                        </h6>
                        <div className="row g-2">
                          {workout.exercises.slice(0, 4).map((exercise, index) => (
                            <div key={index} className="col-sm-6">
                              <div className="bg-light rounded-2 p-2">
                                <div className="fw-medium small">{exercise.exercise_name}</div>
                                <div className="text-muted small">
                                  {exercise.sets && exercise.reps && `${exercise.sets} × ${exercise.reps}`}
                                  {exercise.duration && ` ${exercise.duration}min`}
                                  {exercise.weight && ` ${exercise.weight}lbs`}
                                </div>
                              </div>
                            </div>
                          ))}
                          {workout.exercises.length > 4 && (
                            <div className="col-12">
                              <small className="text-muted">+{workout.exercises.length - 4} more exercises</small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completion Form */}
                    {isCompleting && (
                      <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="fw-bold mb-3">Complete Workout</h6>
                        <div className="row">
                          <div className="col-6">
                            <label className="form-label small">Duration (minutes)</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="60"
                              value={completionDuration}
                              onChange={(e) => setCompletionDuration(e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Calories Burned</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="400"
                              value={completionCalories}
                              onChange={(e) => setCompletionCalories(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="form-label small">Workout Notes</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="How did the workout go? Any achievements or challenges?"
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                          />
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => completeWorkout(workout.id)}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-1" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} className="me-1" />
                                Complete Workout
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setCompletingWorkout(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Completion Summary */}
                    {workout.completed && (
                      <div className="bg-success bg-opacity-10 rounded-3 p-3">
                        <div className="d-flex align-items-center mb-2">
                          <CheckCircle size={16} className="text-success me-2" />
                          <span className="fw-medium text-success">Workout Completed!</span>
                        </div>
                        
                        {(workout.duration || workout.calories_burned) && (
                          <div className="d-flex gap-3 mb-2">
                            {workout.duration && (
                              <span className="small text-muted">
                                <Timer size={12} className="me-1" />
                                {workout.duration} minutes
                              </span>
                            )}
                            {workout.calories_burned && (
                              <span className="small text-muted">
                                <Flame size={12} className="me-1" />
                                {workout.calories_burned} calories burned
                              </span>
                            )}
                          </div>
                        )}
                        
                        {workout.notes && (
                          <p className="small text-muted mb-0">
                            <strong>Notes:</strong> {workout.notes}
                          </p>
                        )}
                      </div>
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

export default EnhancedWorkouts;