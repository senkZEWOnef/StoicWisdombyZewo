import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar as CalendarIcon, Plus, Clock, Save, X, ChevronLeft, ChevronRight,
  Grid3X3, List, Eye, AlertCircle, MapPin, User, Zap
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  created_at: string;
}

const PremiumCalendar: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  
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
    { 
      value: 'meeting', 
      label: 'Meeting', 
      color: 'from-blue-500 to-indigo-600', 
      bgColor: 'bg-blue-500/20',
      emoji: '👥'
    },
    { 
      value: 'work', 
      label: 'Work', 
      color: 'from-emerald-500 to-green-600', 
      bgColor: 'bg-emerald-500/20',
      emoji: '💼'
    },
    { 
      value: 'appointment', 
      label: 'Appointment', 
      color: 'from-cyan-500 to-blue-600', 
      bgColor: 'bg-cyan-500/20',
      emoji: '📅'
    },
    { 
      value: 'personal', 
      label: 'Personal', 
      color: 'from-amber-500 to-yellow-600', 
      bgColor: 'bg-amber-500/20',
      emoji: '🏠'
    },
    { 
      value: 'deadline', 
      label: 'Deadline', 
      color: 'from-red-500 to-red-600', 
      bgColor: 'bg-red-500/20',
      emoji: '⚡'
    },
    { 
      value: 'reminder', 
      label: 'Reminder', 
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-500/20',
      emoji: '🔔'
    }
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

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const getUpcomingEvents = () => {
    return events
      .filter(event => new Date(event.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  const monthDays = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Schedule</h1>
              <p className="text-white/70">Organize your time and stay on track</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{monthName}</h2>
            <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'month' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Month
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 hover-lift"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* New Event Form */}
        {showForm && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                  <p className="text-white/60">Schedule your upcoming activities</p>
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
                  <label className="block text-white font-medium mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Team Meeting, Doctor Appointment..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value} className="bg-slate-800">
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Event details, location, or additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveEvent}
                  disabled={saving || !newTitle.trim() || !newStartDate || !newStartTime}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Event
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

        {/* Calendar Views */}
        {viewMode === 'month' ? (
          /* Month View */
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden hover-lift">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-white/10 border-b border-white/20">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center font-bold text-white/80 border-r border-white/10 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {monthDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index} 
                    className="min-h-[120px] border-r border-b border-white/10 last:border-r-0 p-3 hover:bg-white/5 transition-colors"
                  >
                    {date && (
                      <>
                        <div className="mb-2">
                          <span 
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              isToday 
                                ? 'bg-indigo-500 text-white' 
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const typeInfo = getEventTypeInfo(event.event_type);
                            return (
                              <div 
                                key={event.id}
                                className={`text-xs p-2 rounded-lg text-white bg-gradient-to-r ${typeInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}
                                title={`${event.title} - ${formatTime(event.start_time)}`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(event.start_time)}</span>
                                </div>
                                <div className="font-medium truncate">
                                  {typeInfo.emoji} {event.title}
                                </div>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-white/60 px-2">
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
        ) : (
          /* List View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Eye className="w-6 h-6 text-indigo-400" />
                Upcoming Events ({upcomingEvents.length})
              </h2>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-12 h-12 text-white/40" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No upcoming events</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Your schedule is clear! Create a new event to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingEvents.map((event) => {
                  const typeInfo = getEventTypeInfo(event.event_type);
                  const isToday = new Date(event.start_time).toDateString() === new Date().toDateString();
                  const isPast = new Date(event.start_time) < new Date();
                  
                  return (
                    <div key={event.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${typeInfo.color} flex items-center justify-center`}>
                            <span className="text-xl">{typeInfo.emoji}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{event.title}</h3>
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                              <span className="capitalize">{typeInfo.label}</span>
                              {isToday && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium">
                                  Today
                                </span>
                              )}
                              {isPast && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/80">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>{formatFullDate(event.start_time)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-white/80">
                          <User className="w-4 h-4 text-indigo-400" />
                          <span>
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>

                        {event.description && (
                          <div className="flex items-start gap-3 text-white/80">
                            <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumCalendar;