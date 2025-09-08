import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Feather, Plus, Save, X, Lightbulb, Globe, Search, Star } from 'lucide-react';

interface Poem {
  id: number;
  title: string;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

interface PoetryIdea {
  id: number;
  idea: string;
  inspiration: string;
  created_at: string;
}

const Poetry: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'poems' | 'ideas'>('poems');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [poetryIdeas, setPoetryIdeas] = useState<PoetryIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states for poems
  const [showPoemForm, setShowPoemForm] = useState(false);
  const [newPoemTitle, setNewPoemTitle] = useState('');
  const [newPoemContent, setNewPoemContent] = useState('');
  const [newPoemLanguage, setNewPoemLanguage] = useState('en');
  
  // Form states for ideas
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const [newInspiration, setNewInspiration] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹' }
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

      const [poemsRes, ideasRes] = await Promise.all([
        fetch('http://localhost:5001/poetry', { headers }),
        fetch('http://localhost:5001/poetry-ideas', { headers })
      ]);

      if (poemsRes.ok) {
        const poemsData = await poemsRes.json();
        setPoems(poemsData);
      }

      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setPoetryIdeas(ideasData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePoem = async () => {
    if (!newPoemTitle.trim() || !newPoemContent.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/poetry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPoemTitle,
          content: newPoemContent,
          language: newPoemLanguage
        })
      });

      if (response.ok) {
        resetPoemForm();
        setShowPoemForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving poem:', error);
    } finally {
      setSaving(false);
    }
  };

  const savePoetryIdea = async () => {
    if (!newIdea.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5001/poetry-ideas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idea: newIdea,
          inspiration: newInspiration
        })
      });

      if (response.ok) {
        resetIdeaForm();
        setShowIdeaForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving poetry idea:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetPoemForm = () => {
    setNewPoemTitle('');
    setNewPoemContent('');
    setNewPoemLanguage('en');
  };

  const resetIdeaForm = () => {
    setNewIdea('');
    setNewInspiration('');
  };

  const getLanguageInfo = (code: string) => {
    return languages.find(lang => lang.code === code) || languages[0];
  };

  const filteredPoems = poems.filter(poem => {
    const matchesSearch = poem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poem.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || poem.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const filteredIdeas = poetryIdeas.filter(idea => {
    return idea.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
           idea.inspiration.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">
            <Feather size={24} className="me-2" />
            Poetry & Creative Writing
          </h2>
          <p className="text-muted mb-0">Express yourself in any of your languages</p>
        </div>
        
        <div className="btn-group">
          <button 
            className="btn btn-primary"
            onClick={() => setShowPoemForm(true)}
          >
            <Plus size={16} className="me-2" />
            New Poem
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowIdeaForm(true)}
          >
            <Lightbulb size={16} className="me-2" />
            Capture Idea
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'poems' ? 'active' : ''}`}
            onClick={() => setActiveTab('poems')}
          >
            <Feather size={18} className="me-2" />
            Poems ({poems.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            <Lightbulb size={18} className="me-2" />
            Ideas ({poetryIdeas.length})
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
        {activeTab === 'poems' && (
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <Globe size={16} />
              </span>
              <select
                className="form-select"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* New Poem Form Modal */}
      {showPoemForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <Plus size={20} className="me-2" />
                Create New Poem
              </h5>
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={() => setShowPoemForm(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Poem title..."
                  value={newPoemTitle}
                  onChange={(e) => setNewPoemTitle(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={newPoemLanguage}
                  onChange={(e) => setNewPoemLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <textarea
              className="form-control mb-3"
              rows={12}
              placeholder="Write your poem here... Let your creativity flow in any language that speaks to your heart."
              value={newPoemContent}
              onChange={(e) => setNewPoemContent(e.target.value)}
              style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
            />
            
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={savePoem}
                disabled={saving || !newPoemTitle.trim() || !newPoemContent.trim()}
              >
                {saving ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Save Poem
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowPoemForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Poetry Idea Form Modal */}
      {showIdeaForm && (
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <Lightbulb size={20} className="me-2" />
                Capture Poetry Idea
              </h5>
              <button 
                className="btn btn-sm btn-outline-dark"
                onClick={() => setShowIdeaForm(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              className="form-control mb-3"
              rows={4}
              placeholder="Your poetry idea, verse, or inspiration..."
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
            />
            
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="What inspired this idea? (optional)"
              value={newInspiration}
              onChange={(e) => setNewInspiration(e.target.value)}
            />
            
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning"
                onClick={savePoetryIdea}
                disabled={saving || !newIdea.trim()}
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
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowIdeaForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Display */}
      {activeTab === 'poems' ? (
        <div className="row">
          {filteredPoems.length === 0 ? (
            <div className="col-12 text-center py-5">
              <Feather size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No poems yet</h5>
              <p className="text-muted">
                {searchTerm || filterLanguage !== 'all' 
                  ? "No poems match your search criteria."
                  : "Start writing your first poem above!"
                }
              </p>
            </div>
          ) : (
            filteredPoems.map((poem) => {
              const langInfo = getLanguageInfo(poem.language);
              return (
                <div key={poem.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        {langInfo.flag} {langInfo.name}
                      </span>
                      <small className="text-muted">{formatDate(poem.created_at)}</small>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold">{poem.title}</h6>
                      <div 
                        className="card-text" 
                        style={{ 
                          fontFamily: 'Georgia, serif', 
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.9rem'
                        }}
                      >
                        {poem.content.length > 200 
                          ? `${poem.content.substring(0, 200)}...` 
                          : poem.content
                        }
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <small className="text-muted">
                        <Star size={12} className="me-1" />
                        Created {formatDate(poem.created_at)}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="row">
          {filteredIdeas.length === 0 ? (
            <div className="col-12 text-center py-5">
              <Lightbulb size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No poetry ideas yet</h5>
              <p className="text-muted">
                {searchTerm 
                  ? "No ideas match your search."
                  : "Capture your first poetry inspiration above!"
                }
              </p>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div key={idea.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 border-warning">
                  <div className="card-header bg-warning text-dark">
                    <small className="d-flex justify-content-between align-items-center">
                      <span>
                        <Lightbulb size={14} className="me-1" />
                        Idea
                      </span>
                      <span>{formatDate(idea.created_at)}</span>
                    </small>
                  </div>
                  <div className="card-body">
                    <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {idea.idea}
                    </p>
                    {idea.inspiration && (
                      <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted fw-bold">Inspiration:</small>
                        <br />
                        <small className="text-muted fst-italic">
                          {idea.inspiration}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Poetry;