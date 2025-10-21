import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Target, Plus, CheckCircle, Circle, Calendar, 
  TrendingUp, Save, X, Edit, Trash2, Star, Award,
  ChevronDown, ChevronRight, Flag, Zap, Mountain
} from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  type: 'yearly' | 'monthly' | 'weekly' | 'daily';
  completed: boolean;
  completion_date: string | null;
  target_date: string;
  notes: string;
  created_at: string;
}

interface GoalSummary {
  yearly: { total: number; completed: number };
  monthly: { total: number; completed: number };
  weekly: { total: number; completed: number };
  daily: { total: number; completed: number };
}

const PremiumGoals: React.FC = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<'yearly' | 'monthly' | 'weekly' | 'daily'>('daily');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const goalTypes = [
    { 
      value: 'yearly' as const, 
      label: 'Yearly Goals', 
      icon: Mountain, 
      color: 'from-purple-500 to-indigo-600',
      description: 'Big picture aspirations for the year'
    },
    { 
      value: 'monthly' as const, 
      label: 'Monthly Goals', 
      icon: Flag, 
      color: 'from-blue-500 to-cyan-600',
      description: 'Monthly milestones and achievements'
    },
    { 
      value: 'weekly' as const, 
      label: 'Weekly Goals', 
      icon: Zap, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Weekly focus areas and tasks'
    },
    { 
      value: 'daily' as const, 
      label: 'Daily Goals', 
      icon: Star, 
      color: 'from-amber-500 to-orange-600',
      description: 'Daily habits and quick wins'
    }
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:5001/goals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async () => {
    if (!newTitle.trim()) return;
    
    setSaving(true);
    try {
      const goalData = {
        title: newTitle,
        description: newDescription,
        type: selectedType,
        target_date: newTargetDate || getDefaultTargetDate(selectedType),
        notes: newNotes
      };

      const url = editingGoal 
        ? `http://localhost:5001/goals/${editingGoal.id}`
        : 'http://localhost:5001/goals';
      
      const method = editingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      if (response.ok) {
        resetForm();
        fetchGoals();
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleGoalCompletion = async (goalId: number, completed: boolean) => {
    try {
      const response = await fetch(`http://localhost:5001/goals/${goalId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const deleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const updateGoalNotes = async (goalId: number, notes: string) => {
    try {
      const response = await fetch(`http://localhost:5001/goals/${goalId}/notes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
    setNewNotes('');
    setShowForm(false);
    setEditingGoal(null);
  };

  const getDefaultTargetDate = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'yearly':
        return new Date(now.getFullYear() + 1, 0, 1).toISOString().split('T')[0];
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      case 'weekly':
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (7 - now.getDay()));
        return weekEnd.toISOString().split('T')[0];
      case 'daily':
        return now.toISOString().split('T')[0];
      default:
        return now.toISOString().split('T')[0];
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setNewTitle(goal.title);
    setNewDescription(goal.description);
    setNewTargetDate(goal.target_date);
    setNewNotes(goal.notes);
    setSelectedType(goal.type);
    setShowForm(true);
  };

  const toggleExpanded = (goalId: number) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const getGoalsByType = (type: string) => {
    return goals.filter(goal => goal.type === type);
  };

  const getGoalSummary = (): GoalSummary => {
    const summary: GoalSummary = {
      yearly: { total: 0, completed: 0 },
      monthly: { total: 0, completed: 0 },
      weekly: { total: 0, completed: 0 },
      daily: { total: 0, completed: 0 }
    };

    goals.forEach(goal => {
      summary[goal.type].total++;
      if (goal.completed) {
        summary[goal.type].completed++;
      }
    });

    return summary;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (targetDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(targetDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your goals...</p>
        </div>
      </div>
    );
  }

  const summary = getGoalSummary();
  const currentTypeGoals = getGoalsByType(selectedType);
  const selectedTypeInfo = goalTypes.find(t => t.value === selectedType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Goal Tracking</h1>
              <p className="text-white/70">Set, track, and achieve your aspirations</p>
            </div>
          </div>
        </div>

        {/* Goal Type Summary */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {goalTypes.map((type) => {
            const Icon = type.icon;
            const stats = summary[type.value];
            const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`rounded-2xl backdrop-blur-xl border p-6 text-center transition-all hover-lift ${
                  selectedType === type.value
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{type.label}</h3>
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-2">
                  <span>{stats.completed}/{stats.total}</span>
                  <span>•</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${type.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedTypeInfo.color} flex items-center justify-center`}>
              <selectedTypeInfo.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedTypeInfo.label}</h2>
              <p className="text-white/60 text-sm">{selectedTypeInfo.description}</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 hover-lift"
          >
            <Plus className="w-4 h-4" />
            Add {selectedTypeInfo.label.slice(0, -1)}
          </button>
        </div>

        {/* New Goal Form */}
        {showForm && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedTypeInfo.color} flex items-center justify-center`}>
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingGoal ? 'Edit Goal' : `New ${selectedTypeInfo.label.slice(0, -1)}`}
                  </h2>
                  <p className="text-white/60">Set a clear and achievable target</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Goal Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Read 12 books this year, Exercise 3x per week..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your goal, why it matters, and how you'll achieve it..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Action steps, resources needed, or personal notes..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveGoal}
                  disabled={saving || !newTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingGoal ? 'Update Goal' : 'Save Goal'}
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              {selectedTypeInfo.label} ({currentTypeGoals.length})
            </h2>
          </div>
          
          {currentTypeGoals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No {selectedTypeInfo.label.toLowerCase()} set</h3>
              <p className="text-white/60 max-w-md mx-auto">
                Start by setting your first {selectedTypeInfo.label.toLowerCase().slice(0, -1)} to begin tracking your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTypeGoals.map((goal) => {
                const isExpanded = expandedGoals.has(goal.id);
                const overdue = isOverdue(goal.target_date, goal.completed);
                
                return (
                  <div key={goal.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleGoalCompletion(goal.id, !goal.completed)}
                        className="mt-1 p-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-white/40 hover:text-white/60" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={`text-lg font-bold mb-2 ${
                              goal.completed ? 'text-white/60 line-through' : 'text-white'
                            }`}>
                              {goal.title}
                            </h3>
                            <div className="flex items-center gap-4 text-white/60 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {formatDate(goal.target_date)}</span>
                              </div>
                              {overdue && !goal.completed && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                                  Overdue
                                </span>
                              )}
                              {goal.completed && (
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(goal)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-white/60" />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white/60" />
                            </button>
                            <button
                              onClick={() => toggleExpanded(goal.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-white/60" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-white/60" />
                              )}
                            </button>
                          </div>
                        </div>

                        {goal.description && (
                          <p className="text-white/80 mb-3 leading-relaxed">
                            {goal.description}
                          </p>
                        )}

                        {isExpanded && (
                          <div className="space-y-4 bg-white/10 rounded-xl p-4">
                            <div>
                              <label className="block text-white/80 font-medium mb-2">Notes</label>
                              <textarea
                                defaultValue={goal.notes}
                                onBlur={(e) => updateGoalNotes(goal.id, e.target.value)}
                                placeholder="Add progress notes, thoughts, or action items..."
                                rows={3}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-white/60">Created:</span>
                                <span className="text-white ml-2">{formatDate(goal.created_at)}</span>
                              </div>
                              {goal.completion_date && (
                                <div>
                                  <span className="text-white/60">Completed:</span>
                                  <span className="text-white ml-2">{formatDate(goal.completion_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

export default PremiumGoals;