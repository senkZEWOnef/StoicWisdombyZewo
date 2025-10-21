import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Plus, Edit, Tag, Search, Filter, Sparkles, Brain, Zap, Star, Trash2 } from 'lucide-react';

interface Idea {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

const PremiumIdeas: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'ideas' | 'notes'>('ideas');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states for ideas
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('general');
  
  // Form states for notes
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('general');
  const [newNoteTags, setNewNoteTags] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const categories = [
    { id: 'general', name: 'General', color: 'from-slate-500 to-slate-600', emoji: '📝' },
    { id: 'work', name: 'Work', color: 'from-blue-500 to-blue-600', emoji: '💼' },
    { id: 'personal', name: 'Personal', color: 'from-green-500 to-green-600', emoji: '🌱' },
    { id: 'projects', name: 'Projects', color: 'from-purple-500 to-purple-600', emoji: '🚀' },
    { id: 'learning', name: 'Learning', color: 'from-amber-500 to-amber-600', emoji: '📚' },
    { id: 'health', name: 'Health', color: 'from-emerald-500 to-emerald-600', emoji: '💪' },
    { id: 'travel', name: 'Travel', color: 'from-cyan-500 to-cyan-600', emoji: '✈️' },
    { id: 'creative', name: 'Creative', color: 'from-pink-500 to-pink-600', emoji: '🎨' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [ideasRes, notesRes] = await Promise.all([
        fetch('http://localhost:5001/ideas', { headers }),
        fetch('http://localhost:5001/notes', { headers })
      ]);

      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setIdeas(ideasData);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async () => {
    if (!newIdeaTitle.trim() || !newIdeaContent.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/ideas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newIdeaTitle,
          content: newIdeaContent,
          category: newIdeaCategory
        })
      });

      if (response.ok) {
        setNewIdeaTitle('');
        setNewIdeaContent('');
        setNewIdeaCategory('general');
        fetchData();
      }
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
          category: newNoteCategory,
          tags: newNoteTags
        })
      });

      if (response.ok) {
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteCategory('general');
        setNewNoteTags('');
        fetchData();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteIdea = async (ideaId: number) => {
    console.log('Delete idea called with ID:', ideaId);
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    
    setDeleting(ideaId);
    try {
      console.log('Sending DELETE request to:', `http://localhost:5001/ideas/${ideaId}`);
      const response = await fetch(`http://localhost:5001/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      if (response.ok) {
        console.log('Idea deleted successfully, refreshing data...');
        fetchData();
      } else {
        console.error('Delete failed with status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    } finally {
      setDeleting(null);
    }
  };

  const deleteNote = async (noteId: number) => {
    console.log('Delete note called with ID:', noteId);
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    setDeleting(noteId);
    try {
      console.log('Sending DELETE request to:', `http://localhost:5001/notes/${noteId}`);
      const response = await fetch(`http://localhost:5001/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      if (response.ok) {
        console.log('Note deleted successfully, refreshing data...');
        fetchData();
      } else {
        console.error('Delete failed with status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || idea.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Ideas & Notes</h1>
              <p className="text-white/70">Capture your thoughts and inspiration</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('ideas')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'ideas'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                Ideas ({ideas.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'notes'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Edit className="w-5 h-5" />
                Notes ({notes.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none min-w-[200px]"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-gray-800">
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === 'ideas' ? (
          <>
            {/* New Idea Form */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Capture New Idea</h2>
                  <p className="text-white/60">What brilliant thought just struck you?</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="What's your idea about?"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newIdeaCategory}
                      onChange={(e) => setNewIdeaCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-gray-800">
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <textarea
                  placeholder="Describe your idea in detail..."
                  value={newIdeaContent}
                  onChange={(e) => setNewIdeaContent(e.target.value)}
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-white/60 text-sm">
                    {newIdeaContent.length} characters
                  </p>
                  <button
                    onClick={saveIdea}
                    disabled={saving || !newIdeaTitle.trim() || !newIdeaContent.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Save Idea
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ideas Grid */}
            <div className="space-y-6">
              {filteredIdeas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-12 h-12 text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No ideas yet</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start capturing your brilliant ideas above'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredIdeas.map((idea) => {
                    const categoryInfo = getCategoryInfo(idea.category);
                    return (
                      <div key={idea.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift group">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${categoryInfo.color} text-white text-sm font-medium flex items-center gap-1`}>
                            <span>{categoryInfo.emoji}</span>
                            {categoryInfo.name}
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Star className="w-4 h-4" />
                            {formatDate(idea.created_at)}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3">{idea.title}</h3>
                        <p className="text-white/80 leading-relaxed">
                          {idea.content.length > 150 
                            ? `${idea.content.substring(0, 150)}...` 
                            : idea.content
                          }
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-white/60 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteIdea(idea.id)}
                            disabled={deleting === idea.id}
                            className="text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {deleting === idea.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* New Note Form */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Note</h2>
                  <p className="text-white/60">Organize your thoughts and knowledge</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Note title..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-gray-800">
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <textarea
                  placeholder="Write your note content here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full h-40 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-white/60 text-sm">
                    {newNoteContent.length} characters
                  </p>
                  <button
                    onClick={saveNote}
                    disabled={saving || !newNoteTitle.trim() || !newNoteContent.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Save Note
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="space-y-6">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                    <Edit className="w-12 h-12 text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No notes yet</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first note above'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredNotes.map((note) => {
                    const categoryInfo = getCategoryInfo(note.category);
                    return (
                      <div key={note.id} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift group">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${categoryInfo.color} text-white text-sm font-medium flex items-center gap-1`}>
                            <span>{categoryInfo.emoji}</span>
                            {categoryInfo.name}
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Zap className="w-4 h-4" />
                            {formatDate(note.created_at)}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3">{note.title}</h3>
                        <p className="text-white/80 leading-relaxed mb-4">
                          {note.content.length > 150 
                            ? `${note.content.substring(0, 150)}...` 
                            : note.content
                          }
                        </p>
                        
                        {note.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {note.tags.split(',').map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-lg flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-white/60 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            disabled={deleting === note.id}
                            className="text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {deleting === note.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumIdeas;