import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, Calendar, Edit, Save, X } from 'lucide-react';

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

const Journal: React.FC = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('http://localhost:5001/journal', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newEntry })
      });

      if (response.ok) {
        setNewEntry('');
        fetchEntries(); // Refresh the list
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* New Entry Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <Plus size={20} className="me-2" />
            New Journal Entry
          </h5>
        </div>
        <div className="card-body">
          <textarea
            className="form-control mb-3"
            rows={6}
            placeholder="What's on your mind today? How are you feeling? What are you grateful for?"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={saveEntry}
            disabled={saving || !newEntry.trim()}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Save Entry
              </>
            )}
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="row">
        <div className="col-12">
          <h4 className="mb-4">
            <BookOpen size={24} className="me-2" />
            Your Journal ({entries.length} entries)
          </h4>
          
          {entries.length === 0 ? (
            <div className="text-center py-5">
              <BookOpen size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No journal entries yet</h5>
              <p className="text-muted">Start writing your first entry above to begin your journey.</p>
            </div>
          ) : (
            <div className="row">
              {entries.map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <small className="text-muted d-flex align-items-center">
                        <Calendar size={14} className="me-1" />
                        {formatDate(entry.created_at)}
                      </small>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => startEdit(entry)}
                        disabled={editingId === entry.id}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                    <div className="card-body">
                      {editingId === entry.id ? (
                        <>
                          <textarea
                            className="form-control mb-3"
                            rows={4}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success">
                              <Save size={14} className="me-1" />
                              Save
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEdit}
                            >
                              <X size={14} className="me-1" />
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                          {entry.content.length > 200 
                            ? `${entry.content.substring(0, 200)}...` 
                            : entry.content
                          }
                        </p>
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

export default Journal;