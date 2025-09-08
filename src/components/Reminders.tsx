import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, Check, Clock, Calendar, AlertCircle, Save } from 'lucide-react';

interface Reminder {
  id: number;
  title: string;
  description: string;
  reminder_date: string;
  completed: boolean;
  created_at: string;
}

const Reminders: React.FC = () => {
  const { token } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  // Filter states
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://localhost:5001/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReminder = async () => {
    if (!newTitle.trim() || !newDate || !newTime) return;
    
    setSaving(true);
    try {
      const reminderDateTime = `${newDate}T${newTime}:00`;
      
      const response = await fetch('http://localhost:5001/reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          reminder_date: reminderDateTime
        })
      });

      if (response.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewDate('');
        setNewTime('');
        fetchReminders();
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCompleted = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`http://localhost:5001/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !completed })
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    switch (filter) {
      case 'pending':
        return !reminder.completed;
      case 'completed':
        return reminder.completed;
      default:
        return true;
    }
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getDefaultDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!newDate) setNewDate(getDefaultDate());
    if (!newTime) setNewTime(getDefaultTime());
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const pendingCount = reminders.filter(r => !r.completed).length;
  const overdueCount = reminders.filter(r => !r.completed && isOverdue(r.reminder_date)).length;

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <Bell size={32} className="mb-2" />
              <h3>{pendingCount}</h3>
              <p className="mb-0">Pending Reminders</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <Check size={32} className="mb-2" />
              <h3>{reminders.filter(r => r.completed).length}</h3>
              <p className="mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <AlertCircle size={32} className="mb-2" />
              <h3>{overdueCount}</h3>
              <p className="mb-0">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Reminder Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <Plus size={20} className="me-2" />
            Create New Reminder
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Reminder title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control mb-3"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control mb-3"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <textarea
            className="form-control mb-3"
            rows={3}
            placeholder="Optional description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={saveReminder}
            disabled={saving || !newTitle.trim() || !newDate || !newTime}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Create Reminder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({reminders.length})
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
            <Check size={16} className="me-2" />
            Completed ({reminders.filter(r => r.completed).length})
          </button>
        </li>
      </ul>

      {/* Reminders List */}
      <div className="row">
        {filteredReminders.length === 0 ? (
          <div className="col-12 text-center py-5">
            <Bell size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No reminders found</h5>
            <p className="text-muted">
              {filter === 'all' 
                ? "Create your first reminder above!"
                : `No ${filter} reminders at the moment.`
              }
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const overdue = !reminder.completed && isOverdue(reminder.reminder_date);
            return (
              <div key={reminder.id} className="col-md-6 col-lg-4 mb-4">
                <div className={`card h-100 ${reminder.completed ? 'bg-light' : overdue ? 'border-danger' : ''}`}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {overdue && <AlertCircle size={16} className="text-danger me-2" />}
                      <Calendar size={16} className="me-2 text-muted" />
                      <small className={overdue ? 'text-danger fw-bold' : 'text-muted'}>
                        {formatDateTime(reminder.reminder_date)}
                      </small>
                    </div>
                    <button
                      className={`btn btn-sm ${reminder.completed ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => toggleCompleted(reminder.id, reminder.completed)}
                      title={reminder.completed ? 'Mark as pending' : 'Mark as completed'}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                  <div className="card-body">
                    <h6 className={`card-title ${reminder.completed ? 'text-muted text-decoration-line-through' : ''}`}>
                      {reminder.title}
                    </h6>
                    {reminder.description && (
                      <p className={`card-text ${reminder.completed ? 'text-muted' : ''}`} 
                         style={{ whiteSpace: 'pre-wrap' }}>
                        {reminder.description}
                      </p>
                    )}
                    {reminder.completed && (
                      <div className="mt-2">
                        <span className="badge bg-success">
                          <Check size={12} className="me-1" />
                          Completed
                        </span>
                      </div>
                    )}
                    {overdue && (
                      <div className="mt-2">
                        <span className="badge bg-danger">
                          <AlertCircle size={12} className="me-1" />
                          Overdue
                        </span>
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

export default Reminders;