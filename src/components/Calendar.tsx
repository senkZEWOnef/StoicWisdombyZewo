import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Plus, Clock, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  created_at: string;
}

const Calendar: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [currentView] = useState<'month' | 'week' | 'day'>('month');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newEventType, setNewEventType] = useState('meeting');

  const eventTypes = [
    { value: 'meeting', label: 'Meeting', color: 'bg-primary' },
    { value: 'work', label: 'Work', color: 'bg-success' },
    { value: 'appointment', label: 'Appointment', color: 'bg-info' },
    { value: 'personal', label: 'Personal', color: 'bg-warning' },
    { value: 'deadline', label: 'Deadline', color: 'bg-danger' },
    { value: 'reminder', label: 'Reminder', color: 'bg-secondary' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async () => {
    if (!newTitle.trim() || !newStartDate || !newStartTime) return;
    
    setSaving(true);
    try {
      const startDateTime = `${newStartDate}T${newStartTime}:00`;
      const endDateTime = newEndDate && newEndTime 
        ? `${newEndDate}T${newEndTime}:00` 
        : null;
      
      const response = await fetch('http://localhost:5001/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          start_time: startDateTime,
          end_time: endDateTime,
          event_type: newEventType
        })
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewStartDate('');
    setNewStartTime('');
    setNewEndDate('');
    setNewEndTime('');
    setNewEventType('meeting');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDefaultDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.ceil(now.getMinutes() / 15) * 15).padStart(2, '0');
    return `${hours}:${minutes === '60' ? '00' : minutes}`;
  };

  useEffect(() => {
    if (showForm && !newStartDate) {
      setNewStartDate(getDefaultDate());
      setNewStartTime(getDefaultTime());
      setNewEndDate(getDefaultDate());
    }
  }, [showForm]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const monthDays = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <h2 className="h4 mb-0 me-3">{monthName}</h2>
          <div className="btn-group me-3">
            <button className="btn btn-outline-secondary" onClick={() => navigateMonth('prev')}>
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigateMonth('next')}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="me-2" />
          New Event
        </button>
      </div>

      {/* New Event Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Create New Event</h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Event title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select mb-3"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control mb-3"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control mb-3"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control mb-3"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control mb-3"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Event description (optional)..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={saveEvent}
                disabled={saving || !newTitle.trim() || !newStartDate || !newStartTime}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Create Event
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

      {/* Calendar Grid */}
      <div className="card">
        <div className="card-body p-0">
          {/* Calendar Header */}
          <div className="row g-0 border-bottom bg-light">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="col text-center py-2 fw-bold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="row g-0">
            {monthDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={index} 
                  className="col border-end border-bottom position-relative"
                  style={{ height: '120px' }}
                >
                  {date && (
                    <>
                      <div className="p-2">
                        <span 
                          className={`badge rounded-pill ${isToday ? 'bg-primary' : 'bg-light text-dark'}`}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      
                      <div className="px-2 pb-2">
                        {dayEvents.slice(0, 2).map(event => {
                          const typeInfo = getEventTypeInfo(event.event_type);
                          return (
                            <div 
                              key={event.id}
                              className={`small p-1 mb-1 rounded text-white ${typeInfo.color}`}
                              style={{ fontSize: '10px' }}
                              title={`${event.title} - ${formatTime(event.start_time)}`}
                            >
                              <div className="text-truncate">
                                <Clock size={8} className="me-1" />
                                {formatTime(event.start_time)}
                              </div>
                              <div className="text-truncate fw-bold">
                                {event.title}
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="small text-muted">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="row mt-4">
        <div className="col-12">
          <h5>Upcoming Events</h5>
          {events.filter(event => new Date(event.start_time) >= new Date()).length === 0 ? (
            <div className="text-center py-4">
              <CalendarIcon size={48} className="text-muted mb-3" />
              <p className="text-muted">No upcoming events scheduled</p>
            </div>
          ) : (
            <div className="row">
              {events
                .filter(event => new Date(event.start_time) >= new Date())
                .slice(0, 6)
                .map(event => {
                  const typeInfo = getEventTypeInfo(event.event_type);
                  return (
                    <div key={event.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card">
                        <div className={`card-header ${typeInfo.color} text-white`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-light text-dark">
                              {typeInfo.label}
                            </span>
                            <small>
                              {formatDate(event.start_time)}
                            </small>
                          </div>
                        </div>
                        <div className="card-body">
                          <h6 className="card-title">{event.title}</h6>
                          <p className="card-text small text-muted mb-2">
                            <Clock size={14} className="me-1" />
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </p>
                          {event.description && (
                            <p className="card-text small">
                              {event.description.length > 100 
                                ? `${event.description.substring(0, 100)}...`
                                : event.description
                              }
                            </p>
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

export default Calendar;