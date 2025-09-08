import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Plus, Edit, Save, Tag, Search, Filter } from 'lucide-react';

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

const Ideas: React.FC = () => {
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

  const categories = [
    'general', 'work', 'personal', 'projects', 'learning', 'health', 'travel', 'creative'
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            <Lightbulb size={18} className="me-2" />
            Ideas ({ideas.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <Edit size={18} className="me-2" />
            Notes ({notes.length})
          </button>
        </li>
      </ul>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <Filter size={16} />
            </span>
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeTab === 'ideas' ? (
        <>
          {/* New Idea Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Capture New Idea
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Idea title..."
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select mb-3"
                    value={newIdeaCategory}
                    onChange={(e) => setNewIdeaCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                className="form-control mb-3"
                rows={4}
                placeholder="Describe your idea in detail..."
                value={newIdeaContent}
                onChange={(e) => setNewIdeaContent(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={saveIdea}
                disabled={saving || !newIdeaTitle.trim() || !newIdeaContent.trim()}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Save Idea
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ideas List */}
          <div className="row">
            {filteredIdeas.length === 0 ? (
              <div className="col-12 text-center py-5">
                <Lightbulb size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No ideas yet</h5>
                <p className="text-muted">Capture your first brilliant idea above!</p>
              </div>
            ) : (
              filteredIdeas.map((idea) => (
                <div key={idea.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className="badge bg-secondary">{idea.category}</span>
                      <small className="text-muted">{formatDate(idea.created_at)}</small>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title">{idea.title}</h6>
                      <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {idea.content.length > 150 
                          ? `${idea.content.substring(0, 150)}...` 
                          : idea.content
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* New Note Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Create New Note
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select mb-3"
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Tags (comma-separated)"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                  />
                </div>
              </div>
              <textarea
                className="form-control mb-3"
                rows={6}
                placeholder="Write your note content here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={saveNote}
                disabled={saving || !newNoteTitle.trim() || !newNoteContent.trim()}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="row">
            {filteredNotes.length === 0 ? (
              <div className="col-12 text-center py-5">
                <Edit size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No notes yet</h5>
                <p className="text-muted">Create your first note above!</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className="badge bg-info">{note.category}</span>
                      <small className="text-muted">{formatDate(note.created_at)}</small>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title">{note.title}</h6>
                      <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {note.content.length > 150 
                          ? `${note.content.substring(0, 150)}...` 
                          : note.content
                        }
                      </p>
                      {note.tags && (
                        <div className="mt-2">
                          {note.tags.split(',').map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">
                              <Tag size={12} className="me-1" />
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Ideas;