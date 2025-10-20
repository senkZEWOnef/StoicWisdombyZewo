import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Edit, Save, X, Search, Heart, Trash2 } from 'lucide-react';

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

const PremiumJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('http://localhost:5001/journal', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newEntry })
      });

      if (response.ok) {
        setNewEntry('');
        fetchEntries();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !editingId) return;
    
    try {
      const response = await fetch(`http://localhost:5001/journal/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        fetchEntries();
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const deleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/journal/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeOfDay = (dateString: string) => {
    const date = new Date(dateString);
    const hour = date.getHours();
    if (hour < 12) return { period: 'Morning', icon: '🌅', color: 'text-amber-400' };
    if (hour < 17) return { period: 'Afternoon', icon: '☀️', color: 'text-orange-400' };
    return { period: 'Evening', icon: '🌙', color: 'text-blue-400' };
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === 'all') return matchesSearch;
    
    const entryDate = new Date(entry.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (selectedFilter === 'recent') return diffDays <= 7 && matchesSearch;
    if (selectedFilter === 'thisMonth') return entryDate.getMonth() === now.getMonth() && matchesSearch;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">My Journal</h1>
              <p className="text-white/70 text-sm sm:text-base">Capture your thoughts, dreams, and reflections</p>
            </div>
          </div>
        </div>

        {/* New Entry Section */}
        <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 lg:p-8 hover-lift">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">New Entry</h2>
              <p className="text-white/60 text-sm sm:text-base">What's on your mind today?</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Write about your day, your feelings, your dreams, or anything that comes to mind..."
              className="w-full h-32 sm:h-40 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
            />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <p className="text-white/60 text-xs sm:text-sm">
                {newEntry.length} characters
              </p>
              <button
                onClick={saveEntry}
                disabled={saving || !newEntry.trim()}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'recent', 'thisMonth'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedFilter === filter
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'recent' ? 'Recent' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-400" />
              Your Entries ({filteredEntries.length})
            </h2>
          </div>
          
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No entries found</h3>
              <p className="text-white/60 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms' : 'Start your journaling journey by writing your first entry above'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEntries.map((entry) => {
                const timeInfo = getTimeOfDay(entry.created_at);
                return (
                  <div key={entry.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-lg">{timeInfo.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{formatDate(entry.created_at)}</span>
                            <span className={`text-sm ${timeInfo.color}`}>{timeInfo.period}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/60 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(entry.created_at).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(entry)}
                          disabled={editingId === entry.id}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Edit className="w-5 h-5 text-white/60" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={editingId === entry.id}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete entry"
                        >
                          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </div>
                    
                    {editingId === entry.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>
                    )}
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

export default PremiumJournal;