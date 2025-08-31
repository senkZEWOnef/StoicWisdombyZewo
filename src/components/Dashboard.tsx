import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Target, Heart, BookOpen, Dumbbell, Camera } from 'lucide-react';

interface DashboardStats {
  journalEntries: number;
  todayWorkouts: number;
  todayMeals: number;
  weeklyMoodAverage: number;
  upcomingReminders: number;
  calorieGoal: number;
  caloriesConsumed: number;
}

const Dashboard: React.FC = () => {
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
          weeklyMoodAverage: 7, // Placeholder - would need to calculate from mood_entries
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const calorieProgress = (stats.caloriesConsumed / stats.calorieGoal) * 100;

  return (
    <div>
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h2 className="card-title">🌅 Good day!</h2>
              <p className="card-text mb-0">
                "{dailyQuote}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <BookOpen size={32} className="text-primary mb-2" />
              <h3 className="h5">Journal Entries</h3>
              <p className="h2 mb-0 text-primary">{stats.journalEntries}</p>
              <small className="text-muted">Total written</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <Dumbbell size={32} className="text-success mb-2" />
              <h3 className="h5">Today's Workouts</h3>
              <p className="h2 mb-0 text-success">{stats.todayWorkouts}</p>
              <small className="text-muted">Scheduled for today</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <Camera size={32} className="text-warning mb-2" />
              <h3 className="h5">Meals Logged</h3>
              <p className="h2 mb-0 text-warning">{stats.todayMeals}</p>
              <small className="text-muted">Today</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <Heart size={32} className="text-danger mb-2" />
              <h3 className="h5">Upcoming Reminders</h3>
              <p className="h2 mb-0 text-danger">{stats.upcomingReminders}</p>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Target size={20} className="me-2" />
                Daily Calorie Goal
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>{stats.caloriesConsumed} / {stats.calorieGoal} calories</span>
                <span>{Math.round(calorieProgress)}%</span>
              </div>
              <div className="progress">
                <div 
                  className={`progress-bar ${calorieProgress > 100 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Calendar size={20} className="me-2" />
                Today's Focus
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between px-0">
                  <span>Complete workouts</span>
                  <span className={`badge ${stats.todayWorkouts > 0 ? 'bg-success' : 'bg-secondary'}`}>
                    {stats.todayWorkouts > 0 ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0">
                  <span>Log meals</span>
                  <span className={`badge ${stats.todayMeals >= 3 ? 'bg-success' : 'bg-warning'}`}>
                    {stats.todayMeals}/3
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between px-0">
                  <span>Journal reflection</span>
                  <span className="badge bg-info">Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-primary">New Journal Entry</button>
                <button className="btn btn-outline-success">Add Workout</button>
                <button className="btn btn-outline-warning">Log Meal</button>
                <button className="btn btn-outline-info">Capture Idea</button>
                <button className="btn btn-outline-danger">Set Reminder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;