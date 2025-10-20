import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Save, Calendar, Quote, Brain, TrendingUp,
  Lightbulb, Sunrise, Moon,
  CheckCircle, AlertCircle, Plus
} from 'lucide-react';

interface MoodEntry {
  id: number;
  mood: string;
  energy_level: number;
  notes: string;
  stoic_quote: string;
  entry_type: 'morning' | 'evening';
  entry_date: string;
  one_word_feeling: string;
  created_at: string;
}

interface DayEntries {
  date: string;
  morning?: MoodEntry;
  evening?: MoodEntry;
}

const PremiumMoodWisdom: React.FC = () => {
  const { token } = useAuth();
  const [dailyQuote, setDailyQuote] = useState('');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Current mood form
  const [activeEntry, setActiveEntry] = useState<'morning' | 'evening' | null>(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [oneWordFeeling, setOneWordFeeling] = useState('');

  const moods = [
    { 
      name: 'Joyful', 
      emoji: '😊', 
      value: 'joyful', 
      color: 'from-yellow-400 to-orange-500', 
      description: 'Radiant & uplifted'
    },
    { 
      name: 'Calm', 
      emoji: '😌', 
      value: 'calm', 
      color: 'from-green-400 to-emerald-500', 
      description: 'Peaceful & centered'
    },
    { 
      name: 'Neutral', 
      emoji: '😐', 
      value: 'neutral', 
      color: 'from-blue-400 to-cyan-500', 
      description: 'Balanced & steady'
    },
    { 
      name: 'Stressed', 
      emoji: '😰', 
      value: 'stressed', 
      color: 'from-orange-400 to-red-500', 
      description: 'Overwhelmed & tense'
    },
    { 
      name: 'Sad', 
      emoji: '😢', 
      value: 'sad', 
      color: 'from-indigo-400 to-purple-500', 
      description: 'Melancholy & reflective'
    },
    { 
      name: 'Angry', 
      emoji: '😠', 
      value: 'angry', 
      color: 'from-red-500 to-red-600', 
      description: 'Frustrated & intense'
    }
  ];

  // Stoic quotes mapped to moods and times
  const stoicQuotes = {
    morning: {
      joyful: [
        "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness. - Marcus Aurelius",
        "Every new beginning comes from some other beginning's end. - Seneca",
        "The best revenge is not to be like your enemy. - Marcus Aurelius"
      ],
      calm: [
        "You have power over your mind - not outside events. Realize this, and you will find strength. - Marcus Aurelius",
        "Today I escaped anxiety. Or no, I discarded it, because it was within me, in my own perceptions—not outside. - Marcus Aurelius",
        "The mind that is not baffled is not employed. - Wendell Berry"
      ],
      neutral: [
        "Accept the things to which fate binds you, and love the people with whom fate associates you. - Marcus Aurelius",
        "It is not what happens to you, but how you react to it that matters. - Epictetus",
        "The best revenge is not to be like your enemy. - Marcus Aurelius"
      ],
      stressed: [
        "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. - Marcus Aurelius",
        "Confine yourself to the present. - Marcus Aurelius",
        "You are an actor in a play, which is as the author wants it to be. - Epictetus"
      ],
      sad: [
        "Very little is needed to make a happy life; it is all within yourself, in your way of thinking. - Marcus Aurelius",
        "The universe is change; our life is what our thoughts make it. - Marcus Aurelius",
        "When we are no longer able to change a situation, we are challenged to change ourselves. - Viktor Frankl"
      ],
      angry: [
        "How much trouble he avoids who does not look to see what his neighbor says or does. - Marcus Aurelius",
        "The best revenge is not to be like your enemy. - Marcus Aurelius",
        "You have power over your mind - not outside events. Realize this, and you will find strength. - Marcus Aurelius"
      ]
    },
    evening: {
      joyful: [
        "At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work—as a human being.' - Marcus Aurelius",
        "Be like the rocky headland on which the waves constantly break. It stands firm, and round it the seething waters are laid to rest. - Marcus Aurelius",
        "The happiness of your life depends upon the quality of your thoughts. - Marcus Aurelius"
      ],
      calm: [
        "When you lie down, you will not be afraid; when you lie down, your sleep will be sweet. - Proverbs 3:24",
        "Let all your things have their places; let each part of your business have its time. - Benjamin Franklin",
        "Peace comes from within. Do not seek it without. - Buddha"
      ],
      neutral: [
        "Accept the things to which fate binds you, and love the people with whom fate associates you. - Marcus Aurelius",
        "The universe is change; our life is what our thoughts make it. - Marcus Aurelius",
        "What we do now echoes in eternity. - Marcus Aurelius"
      ],
      stressed: [
        "You have power over your mind - not outside events. Realize this, and you will find strength. - Marcus Aurelius",
        "Don't explain your philosophy. Embody it. - Epictetus",
        "The mind that is anxious about future misfortunes is miserable. - Seneca"
      ],
      sad: [
        "The universe is change; our life is what our thoughts make it. - Marcus Aurelius",
        "Very little is needed to make a happy life; it is all within yourself, in your way of thinking. - Marcus Aurelius",
        "No person was ever honored for what he received. Honor has been the reward for what he gave. - Calvin Coolidge"
      ],
      angry: [
        "How much trouble he avoids who does not look to see what his neighbor says or does. - Marcus Aurelius",
        "The best revenge is not to be like your enemy. - Marcus Aurelius",
        "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. - Marcus Aurelius"
      ]
    }
  };

  useEffect(() => {
    fetchDailyQuote();
    fetchMoodEntries();
  }, [selectedDate]);

  const fetchDailyQuote = async () => {
    try {
      const response = await fetch(`http://localhost:5001/daily?date=${selectedDate}`);
      const data = await response.json();
      setDailyQuote(data.quote);
    } catch (error) {
      console.error('Error fetching daily quote:', error);
      setDailyQuote("The happiness of your life depends upon the quality of your thoughts. - Marcus Aurelius");
    }
  };

  const fetchMoodEntries = async () => {
    try {
      const response = await fetch(`http://localhost:5001/mood-entries?date=${selectedDate}`, {
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

  const generateStoicQuote = (mood: string, entryType: 'morning' | 'evening') => {
    const quotes = stoicQuotes[entryType][mood as keyof typeof stoicQuotes.morning] || stoicQuotes[entryType].neutral;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    // setGeneratedQuote(randomQuote);
    return randomQuote;
  };

  const saveMoodEntry = async () => {
    if (!selectedMood || !activeEntry || !oneWordFeeling.trim()) return;
    
    setSaving(true);
    try {
      const quote = generateStoicQuote(selectedMood, activeEntry);
      
      const response = await fetch('http://localhost:5001/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mood: selectedMood,
          energy_level: energyLevel,
          notes: moodNotes,
          entry_type: activeEntry,
          entry_date: selectedDate,
          one_word_feeling: oneWordFeeling,
          stoic_quote: quote
        })
      });

      if (response.ok) {
        setSelectedMood('');
        setEnergyLevel(5);
        setMoodNotes('');
        setOneWordFeeling('');
        setActiveEntry(null);
        fetchMoodEntries();
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMoodData = (mood: string) => {
    return moods.find(m => m.value === mood) || moods[2];
  };

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'morning';
    if (hour >= 18 && hour <= 23) return 'evening';
    return null;
  };

  const canCreateEntry = (type: 'morning' | 'evening') => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;
    
    const currentSlot = getCurrentTimeSlot();
    return currentSlot === type;
  };

  const getEntriesForDate = (date: string): DayEntries => {
    const dayEntries = moodEntries.filter(entry => {
      // Handle both date strings and full ISO dates
      const entryDate = entry.entry_date ? entry.entry_date.split('T')[0] : entry.created_at.split('T')[0];
      return entryDate === date;
    });
    return {
      date,
      morning: dayEntries.find(entry => entry.entry_type === 'morning'),
      evening: dayEntries.find(entry => entry.entry_type === 'evening')
    };
  };

  const getRecentDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days.map(date => getEntriesForDate(date));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSlotInfo = (type: 'morning' | 'evening') => {
    return type === 'morning' 
      ? { icon: Sunrise, label: 'Morning', time: '4AM - 12PM', color: 'from-amber-500 to-orange-600' }
      : { icon: Moon, label: 'Evening', time: '6PM - 12AM', color: 'from-indigo-500 to-purple-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your wisdom...</p>
        </div>
      </div>
    );
  }

  const recentDays = getRecentDays();
  const todayEntries = getEntriesForDate(selectedDate);
  // const currentTimeSlot = getCurrentTimeSlot();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Daily Reflection</h1>
              <p className="text-white/70">Track your mood twice daily and receive Stoic wisdom</p>
            </div>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center hover-lift">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Today's Stoic Wisdom</h2>
          </div>
          <blockquote className="text-white/90 text-lg leading-relaxed max-w-4xl mx-auto">
            <p className="mb-4 italic">"{dailyQuote}"</p>
          </blockquote>
        </div>

        {/* Date Selector */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <Calendar className="w-5 h-5 text-white/70" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-white/70">{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Today's Entries */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Morning Entry */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  <Sunrise className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Morning Check-in</h3>
                  <p className="text-white/60 text-sm">4:00 AM - 12:00 PM</p>
                </div>
              </div>
              
              {todayEntries.morning ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : canCreateEntry('morning') ? (
                <button
                  onClick={() => setActiveEntry('morning')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              ) : (
                <AlertCircle className="w-6 h-6 text-white/40" />
              )}
            </div>

            {todayEntries.morning ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodData(todayEntries.morning.mood).emoji}</span>
                  <div>
                    <p className="text-white font-medium capitalize">{todayEntries.morning.mood}</p>
                    <p className="text-white/60 text-sm">Energy: {todayEntries.morning.energy_level}/10</p>
                  </div>
                </div>
                
                {todayEntries.morning.one_word_feeling && (
                  <p className="text-white/80 mb-2">
                    <span className="text-white/60">One word: </span>
                    <span className="font-medium text-amber-300">"{todayEntries.morning.one_word_feeling}"</span>
                  </p>
                )}
                
                {todayEntries.morning.notes && (
                  <p className="text-white/80 italic">"{todayEntries.morning.notes}"</p>
                )}
                
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">Morning Wisdom</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed italic">
                    "{todayEntries.morning.stoic_quote}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sunrise className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  {canCreateEntry('morning') 
                    ? 'Start your day with reflection'
                    : selectedDate === new Date().toISOString().split('T')[0]
                      ? 'Morning entries available 4:00 AM - 12:00 PM'
                      : 'No morning entry recorded'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Evening Entry */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Evening Reflection</h3>
                  <p className="text-white/60 text-sm">6:00 PM - 12:00 AM</p>
                </div>
              </div>
              
              {todayEntries.evening ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : canCreateEntry('evening') ? (
                <button
                  onClick={() => setActiveEntry('evening')}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              ) : (
                <AlertCircle className="w-6 h-6 text-white/40" />
              )}
            </div>

            {todayEntries.evening ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodData(todayEntries.evening.mood).emoji}</span>
                  <div>
                    <p className="text-white font-medium capitalize">{todayEntries.evening.mood}</p>
                    <p className="text-white/60 text-sm">Energy: {todayEntries.evening.energy_level}/10</p>
                  </div>
                </div>
                
                {todayEntries.evening.one_word_feeling && (
                  <p className="text-white/80 mb-2">
                    <span className="text-white/60">One word: </span>
                    <span className="font-medium text-indigo-300">"{todayEntries.evening.one_word_feeling}"</span>
                  </p>
                )}
                
                {todayEntries.evening.notes && (
                  <p className="text-white/80 italic">"{todayEntries.evening.notes}"</p>
                )}
                
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-400 text-sm font-medium">Evening Wisdom</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed italic">
                    "{todayEntries.evening.stoic_quote}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  {canCreateEntry('evening') 
                    ? 'Reflect on your day'
                    : selectedDate === new Date().toISOString().split('T')[0]
                      ? 'Evening entries available 6:00 PM - 12:00 AM'
                      : 'No evening entry recorded'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Entry Form */}
        {activeEntry && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTimeSlotInfo(activeEntry).color} flex items-center justify-center`}>
                  {React.createElement(getTimeSlotInfo(activeEntry).icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{getTimeSlotInfo(activeEntry).label} Check-in</h2>
                  <p className="text-white/60">How are you feeling right now?</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEntry(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Mood Selection */}
              <div>
                <label className="block text-white font-medium mb-4">How are you feeling?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedMood === mood.value
                          ? `border-white bg-gradient-to-r ${mood.color} shadow-lg`
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <h3 className={`font-bold mb-1 ${selectedMood === mood.value ? 'text-white' : 'text-white/80'}`}>
                          {mood.name}
                        </h3>
                        <p className={`text-xs ${selectedMood === mood.value ? 'text-white/90' : 'text-white/60'}`}>
                          {mood.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-medium">Energy Level</label>
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                    {energyLevel}/10
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-white/60 text-sm mt-2">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              {/* One Word Feeling */}
              <div>
                <label className="block text-white font-medium mb-2">One word to describe how you're feeling? *</label>
                <input
                  type="text"
                  value={oneWordFeeling}
                  onChange={(e) => setOneWordFeeling(e.target.value)}
                  placeholder="e.g., grateful, exhausted, hopeful, overwhelmed..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white font-medium mb-2">What's on your mind? (optional)</label>
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="Share your thoughts, feelings, or what happened today..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={saveMoodEntry}
                disabled={saving || !selectedMood || !oneWordFeeling.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating wisdom...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save & Get Stoic Wisdom
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PremiumMoodWisdom;