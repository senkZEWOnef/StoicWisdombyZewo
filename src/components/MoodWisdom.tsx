import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Smile, Frown, Meh, Sun, Cloud, CloudRain, Zap, Save, BarChart3, Calendar, Quote } from 'lucide-react';

interface MoodEntry {
  id: number;
  mood: string;
  energy_level: number;
  notes: string;
  stoic_quote: string;
  created_at: string;
}

const MoodWisdom: React.FC = () => {
  const { token } = useAuth();
  const [dailyQuote, setDailyQuote] = useState('');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Current mood form
  const [selectedMood, setSelectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [currentQuote, setCurrentQuote] = useState('');

  const moods = [
    { name: 'Excellent', emoji: '😊', value: 'happy', color: 'success', icon: Sun },
    { name: 'Good', emoji: '🙂', value: 'calm', color: 'info', icon: Smile },
    { name: 'Okay', emoji: '😐', value: 'neutral', color: 'warning', icon: Meh },
    { name: 'Sad', emoji: '😢', value: 'sad', color: 'primary', icon: Cloud },
    { name: 'Anxious', emoji: '😰', value: 'anxious', color: 'secondary', icon: CloudRain },
    { name: 'Angry', emoji: '😠', value: 'angry', color: 'danger', icon: Zap }
  ];

  useEffect(() => {
    fetchDailyQuote();
    fetchMoodEntries();
  }, []);

  const fetchDailyQuote = async () => {
    try {
      const response = await fetch('http://localhost:5001/daily');
      const data = await response.json();
      setDailyQuote(data.quote);
    } catch (error) {
      console.error('Error fetching daily quote:', error);
    }
  };

  const fetchMoodEntries = async () => {
    try {
      const response = await fetch('http://localhost:5001/mood-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoodEntries(data);
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mood: selectedMood,
          energy_level: energyLevel,
          notes: moodNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuote(data.quote);
        setSelectedMood('');
        setEnergyLevel(5);
        setMoodNotes('');
        fetchMoodEntries();
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    const moodData = moods.find(m => m.value === mood);
    return moodData ? moodData.emoji : '😐';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEnergyColor = (level: number) => {
    if (level <= 3) return 'danger';
    if (level <= 6) return 'warning';
    return 'success';
  };

  const getRecentMoodStats = () => {
    const recent = moodEntries.slice(0, 7);
    if (recent.length === 0) return null;

    const avgEnergy = recent.reduce((sum, entry) => sum + entry.energy_level, 0) / recent.length;
    const moodCounts = recent.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return { avgEnergy: Math.round(avgEnergy * 10) / 10, mostCommonMood };
  };

  const stats = getRecentMoodStats();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Daily Wisdom Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body text-center py-4">
              <h2 className="card-title">🧘 Daily Stoic Wisdom</h2>
              <blockquote className="blockquote mb-0">
                <p className="mb-3 fs-5">"{dailyQuote || 'Loading wisdom...'}"</p>
                <footer className="blockquote-footer text-light">
                  <cite>Marcus Aurelius</cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <BarChart3 size={32} className="mb-2" />
                <h3>{stats.avgEnergy}/10</h3>
                <p className="mb-0">Average Energy (7 days)</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <Heart size={32} className="mb-2" />
                <h3>{moodEntries.length}</h3>
                <p className="mb-0">Total Mood Entries</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <Smile size={32} className="mb-2" />
                <h3>{getMoodIcon(stats.mostCommonMood || '')}</h3>
                <p className="mb-0">Most Common Mood</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Input Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Heart size={20} className="me-2" />
                How are you feeling today?
              </h5>
            </div>
            <div className="card-body">
              {/* Mood Selection */}
              <div className="row mb-4">
                {moods.map((mood) => (
                  <div key={mood.value} className="col-6 col-md-4 col-lg-2 mb-3">
                    <button
                      className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 ${
                        selectedMood === mood.value ? `btn-${mood.color}` : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSelectedMood(mood.value)}
                      style={{ minHeight: '100px' }}
                    >
                      <div className="fs-1 mb-2">{mood.emoji}</div>
                      <div className="small">{mood.name}</div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Energy Level */}
              <div className="mb-3">
                <label className="form-label">
                  Energy Level: <span className={`badge bg-${getEnergyColor(energyLevel)}`}>
                    {energyLevel}/10
                  </span>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="What's on your mind? Any specific thoughts about your mood today?"
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                />
              </div>

              {/* Save Button */}
              <button
                className="btn btn-primary"
                onClick={saveMoodEntry}
                disabled={saving || !selectedMood}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Log Mood
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Quote */}
      {currentQuote && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <Quote size={20} className="me-2" />
                Your Personal Stoic Wisdom
              </div>
              <div className="card-body">
                <blockquote className="blockquote mb-0">
                  <p>{currentQuote}</p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Mood History */}
      <div className="row">
        <div className="col-12">
          <h5 className="mb-3">
            <Calendar size={20} className="me-2" />
            Recent Mood Entries
          </h5>
          
          {moodEntries.length === 0 ? (
            <div className="text-center py-5">
              <Heart size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No mood entries yet</h5>
              <p className="text-muted">Start tracking your mood to see patterns and get personalized wisdom.</p>
            </div>
          ) : (
            <div className="row">
              {moodEntries.slice(0, 6).map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="fs-4 me-2">{getMoodIcon(entry.mood)}</span>
                        <span className="fw-bold text-capitalize">{entry.mood}</span>
                      </div>
                      <small className="text-muted">{formatDate(entry.created_at)}</small>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">
                        <small className="text-muted">Energy Level:</small>
                        <span className={`badge bg-${getEnergyColor(entry.energy_level)} ms-2`}>
                          {entry.energy_level}/10
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="card-text small mb-2">
                          {entry.notes}
                        </p>
                      )}
                      {entry.stoic_quote && (
                        <blockquote className="blockquote small">
                          <p className="mb-0 text-muted fst-italic">
                            "{entry.stoic_quote}"
                          </p>
                        </blockquote>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodWisdom;