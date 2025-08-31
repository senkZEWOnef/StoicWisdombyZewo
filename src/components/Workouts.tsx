import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Plus, Clock, CheckCircle, Calendar, Target, Timer, Flame, Edit, Save, X, TrendingUp } from 'lucide-react';

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

const Workouts: React.FC = () => {
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

  const workoutTypes = [
    'Cardio', 'Strength Training', 'Yoga', 'Running', 'Cycling', 'Swimming',
    'HIIT', 'Pilates', 'CrossFit', 'Walking', 'Dancing', 'Sports'
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      thisWeekCompleted
    };
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

  const stats = getWorkoutStats();
  const pendingCount = workouts.filter(w => !w.completed).length;
  const overdueCount = workouts.filter(w => !w.completed && isOverdue(w.target_date, w.completed)).length;

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
              <h3 className="fw-bold text-dark mb-1">{pendingCount}</h3>
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

      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Your Workouts</h4>
          <p className="text-muted mb-0">Track your fitness journey and stay motivated</p>
        </div>
        <button 
          className="btn btn-success d-flex align-items-center"
          onClick={() => setShowForm(true)}
          style={{ borderRadius: '12px' }}
        >
          <Plus size={18} className="me-2" />
          Add Workout
        </button>
      </div>

      {/* New Workout Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-success text-white" style={{ borderRadius: '16px 16px 0 0' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Plan New Workout
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
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label fw-medium">Workout Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Morning Cardio, Upper Body Strength..."
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-medium">Target Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newWorkoutDate}
                    onChange={(e) => setNewWorkoutDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Description (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe your workout plan, exercises, or goals..."
                value={newWorkoutDescription}
                onChange={(e) => setNewWorkoutDescription(e.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Quick Templates</label>
              <div className="d-flex flex-wrap gap-2">
                {workoutTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setNewWorkoutName(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={saveWorkout}
                disabled={saving || !newWorkoutName.trim() || !newWorkoutDate}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Save Workout
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
            Pending ({pendingCount})
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

      {/* Workouts List */}
      <div className="row">
        {filteredWorkouts.length === 0 ? (
          <div className="col-12 text-center py-5">
            <Dumbbell size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No workouts found</h5>
            <p className="text-muted">
              {filter === 'all' 
                ? "Plan your first workout above!"
                : `No ${filter} workouts at the moment.`
              }
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const overdue = isOverdue(workout.target_date, workout.completed);
            const isCompleting = completingWorkout === workout.id;
            
            return (
              <div key={workout.id} className="col-lg-6 mb-4">
                <div className={`card border-0 shadow-sm h-100 ${workout.completed ? 'bg-light' : overdue ? 'border-danger' : ''}`}
                     style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                           style={{ 
                             width: '40px', 
                             height: '40px', 
                             backgroundColor: workout.completed ? '#43e97b20' : '#4facfe20' 
                           }}>
                        {workout.completed ? 
                          <CheckCircle size={20} style={{ color: '#43e97b' }} /> :
                          <Dumbbell size={20} style={{ color: '#4facfe' }} />
                        }
                      </div>
                      <div>
                        <h6 className={`fw-bold mb-0 ${workout.completed ? 'text-muted' : 'text-dark'}`}>
                          {workout.name}
                        </h6>
                        <small className="text-muted d-flex align-items-center">
                          <Calendar size={12} className="me-1" />
                          {formatDate(workout.target_date)}
                        </small>
                      </div>
                    </div>
                    
                    {!workout.completed && !isCompleting && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => setCompletingWorkout(workout.id)}
                      >
                        <CheckCircle size={14} className="me-1" />
                        Complete
                      </button>
                    )}
                  </div>
                  
                  <div className="card-body pt-0">
                    {workout.description && (
                      <p className="text-muted mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                        {workout.description}
                      </p>
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
                              placeholder="30"
                              value={completionDuration}
                              onChange={(e) => setCompletionDuration(e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Calories Burned</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="300"
                              value={completionCalories}
                              onChange={(e) => setCompletionCalories(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="form-label small">Notes</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="How did it go? Any achievements or challenges?"
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
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} className="me-1" />
                                Complete
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

                    {/* Completion Info */}
                    {workout.completed && (
                      <div className="bg-success bg-opacity-10 rounded-3 p-3">
                        <div className="d-flex align-items-center mb-2">
                          <CheckCircle size={16} className="text-success me-2" />
                          <span className="fw-medium text-success">Completed</span>
                          <small className="text-muted ms-auto">
                            {formatDateTime(workout.completion_date || '')}
                          </small>
                        </div>
                        
                        {(workout.duration || workout.calories_burned) && (
                          <div className="d-flex gap-3 mb-2">
                            {workout.duration && (
                              <span className="small text-muted">
                                <Timer size={12} className="me-1" />
                                {workout.duration} min
                              </span>
                            )}
                            {workout.calories_burned && (
                              <span className="small text-muted">
                                <Flame size={12} className="me-1" />
                                {workout.calories_burned} cal
                              </span>
                            )}
                          </div>
                        )}
                        
                        {workout.notes && (
                          <p className="small text-muted mb-0">
                            "{workout.notes}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Overdue Warning */}
                    {overdue && !workout.completed && (
                      <div className="alert alert-warning small mb-0">
                        <strong>Overdue!</strong> This workout was scheduled for {formatDate(workout.target_date)}.
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

export default Workouts;