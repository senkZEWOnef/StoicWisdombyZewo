import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Book, Camera, ArrowLeft, Upload, X, Edit, Save, Search, Filter, Trash2 } from 'lucide-react';

interface BookNote {
  id: number;
  content: string;
  image_path?: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  cover_image?: string;
  description?: string;
  status: 'reading' | 'completed' | 'want-to-read';
  rating?: number;
  created_at: string;
  notes?: BookNote[];
}

const PremiumBooks: React.FC = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  // const [editingNote] = useState<BookNote | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Book form state
  const [bookForm, setBookForm] = useState<{
    title: string;
    author: string;
    genre: string;
    description: string;
    status: 'reading' | 'completed' | 'want-to-read';
    rating: number;
  }>({
    title: '',
    author: '',
    genre: '',
    description: '',
    status: 'reading',
    rating: 0
  });

  // Note form state
  const [noteForm, setNoteForm] = useState({
    content: '',
    image: null as File | null
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5001/books', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookWithNotes = async (bookId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/books/${bookId}/notes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedBook(data);
      }
    } catch (error) {
      console.error('Error fetching book notes:', error);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', bookForm.title);
    formData.append('author', bookForm.author);
    formData.append('genre', bookForm.genre);
    formData.append('description', bookForm.description);
    formData.append('status', bookForm.status);
    formData.append('rating', bookForm.rating.toString());
    
    if (coverImage) {
      formData.append('cover', coverImage);
    }

    try {
      const response = await fetch('http://localhost:5001/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowAddBook(false);
        setBookForm({ title: '', author: '', genre: '', description: '', status: 'reading', rating: 0 });
        setCoverImage(null);
        fetchBooks();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    const formData = new FormData();
    formData.append('content', noteForm.content);
    formData.append('bookId', selectedBook.id.toString());
    
    if (noteForm.image) {
      formData.append('image', noteForm.image);
    }

    try {
      const response = await fetch('http://localhost:5001/book-notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowAddNote(false);
        setNoteForm({ content: '', image: null });
        fetchBookWithNotes(selectedBook.id);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    
    const formData = new FormData();
    formData.append('title', bookForm.title);
    formData.append('author', bookForm.author);
    formData.append('genre', bookForm.genre);
    formData.append('description', bookForm.description);
    formData.append('status', bookForm.status);
    formData.append('rating', bookForm.rating.toString());
    
    if (coverImage) {
      formData.append('cover', coverImage);
    }

    try {
      const response = await fetch(`http://localhost:5001/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowEditBook(false);
        setCoverImage(null);
        fetchBookWithNotes(selectedBook.id);
        fetchBooks();
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book? This will also delete all notes.')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/books/${bookId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      if (response.ok) {
        setSelectedBook(null);
        fetchBooks();
      } else {
        console.error('Delete failed with status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/book-notes/${noteId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      if (response.ok && selectedBook) {
        fetchBookWithNotes(selectedBook.id);
      } else {
        console.error('Delete note failed with status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startEditBook = () => {
    if (!selectedBook) return;
    setBookForm({
      title: selectedBook.title,
      author: selectedBook.author,
      genre: selectedBook.genre || '',
      description: selectedBook.description || '',
      status: selectedBook.status,
      rating: selectedBook.rating || 0
    });
    setShowEditBook(true);
  };

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'note') => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      if (type === 'cover') {
        setCoverImage(imageFile);
      } else {
        setNoteForm({ ...noteForm, image: imageFile });
      }
    }
  };

  // Filter books based on search query and status
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Book Detail View
  if (selectedBook) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Books
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={startEditBook}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Edit size={20} />
              Edit Book
            </button>
            <button
              onClick={() => handleDeleteBook(selectedBook.id)}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={20} />
              Delete Book
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              {selectedBook.cover_image ? (
                <img
                  src={`http://localhost:5001/uploads/${selectedBook.cover_image}`}
                  alt={selectedBook.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full max-w-sm mx-auto h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Book size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-white mb-2">{selectedBook.title}</h1>
              <p className="text-xl text-gray-300 mb-4">by {selectedBook.author}</p>
              
              {selectedBook.genre && (
                <p className="text-gray-400 mb-2">Genre: {selectedBook.genre}</p>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedBook.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  selectedBook.status === 'reading' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {selectedBook.status.replace('-', ' ')}
                </span>
                
                {selectedBook.rating && selectedBook.rating > 0 && (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < (selectedBook.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedBook.description && (
                <p className="text-gray-300 leading-relaxed">{selectedBook.description}</p>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Reading Notes</h2>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Note
              </button>
            </div>

            {showAddNote && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <form onSubmit={handleAddNote}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note Content
                    </label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Write your thoughts, quotes, or insights..."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Image (optional)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onDrop={(e) => handleDrop(e, 'note')}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                    >
                      {noteForm.image ? (
                        <div className="flex items-center justify-center gap-2">
                          <Camera size={20} className="text-green-600" />
                          <span className="text-green-600">{noteForm.image.name}</span>
                          <button
                            type="button"
                            onClick={() => setNoteForm({ ...noteForm, image: null })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">Drop an image here or click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && setNoteForm({ ...noteForm, image: e.target.files[0] })}
                            className="hidden"
                            id="note-image"
                          />
                          <label
                            htmlFor="note-image"
                            className="inline-block mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Save size={20} />
                      Save Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddNote(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {selectedBook.notes && selectedBook.notes.length > 0 ? (
                selectedBook.notes.map((note) => (
                  <div key={note.id} className="bg-slate-700/30 border border-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-200 mb-3">{note.content}</p>
                    {note.image_path && (
                      <img
                        src={`http://localhost:5001/uploads/${note.image_path}`}
                        alt="Note"
                        className="max-w-sm rounded-lg shadow-sm"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No notes yet. Add your first note to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Books Grid View
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Reading Journal</h1>
            <p className="text-gray-300 mt-2">Track your books, notes, and reading progress</p>
          </div>
          <button
            onClick={() => setShowAddBook(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Book
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Books</option>
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-gray-400 text-sm">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Book</h2>
              <button
                onClick={() => setShowAddBook(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddBook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={bookForm.genre}
                  onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Fiction, Self-help, Philosophy"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={bookForm.status}
                  onChange={(e) => setBookForm({ ...bookForm, status: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBookForm({ ...bookForm, rating: star })}
                      className={`text-2xl ${star <= bookForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="What's this book about?"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Cover
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  {coverImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Book size={20} className="text-green-600" />
                      <span className="text-green-600">{coverImage.name}</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Drop cover image here</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && setCoverImage(e.target.files[0])}
                        className="hidden"
                        id="cover-image"
                      />
                      <label
                        htmlFor="cover-image"
                        className="inline-block mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBook(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditBook && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Book</h2>
              <button
                onClick={() => setShowEditBook(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditBook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={bookForm.genre}
                  onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Fiction, Self-help, Philosophy"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={bookForm.status}
                  onChange={(e) => setBookForm({ ...bookForm, status: e.target.value as any })}
                  className="w-full p-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBookForm({ ...bookForm, rating: star })}
                      className={`text-2xl ${star <= bookForm.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="What's this book about?"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Update Book Cover
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
                  }`}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  {coverImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Book size={20} className="text-green-400" />
                      <span className="text-green-400">{coverImage.name}</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-400">Drop new cover image here</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && setCoverImage(e.target.files[0])}
                        className="hidden"
                        id="edit-cover-image"
                      />
                      <label
                        htmlFor="edit-cover-image"
                        className="inline-block mt-2 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg cursor-pointer hover:bg-slate-600"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditBook(false)}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => fetchBookWithNotes(book.id)}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg shadow-md hover:shadow-lg hover:border-white/20 transition-all cursor-pointer overflow-hidden"
            >
              <div className="aspect-[3/4] bg-slate-700/50 relative">
                {book.cover_image ? (
                  <img
                    src={`http://localhost:5001/uploads/${book.cover_image}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Book size={48} className="text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs backdrop-blur-sm ${
                  book.status === 'completed' ? 'bg-green-500/80 text-green-100' :
                  book.status === 'reading' ? 'bg-blue-500/80 text-blue-100' :
                  'bg-yellow-500/80 text-yellow-100'
                }`}>
                  {book.status === 'want-to-read' ? 'Want to Read' : 
                   book.status === 'reading' ? 'Reading' : 'Completed'}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-gray-300 text-sm mb-2">{book.author}</p>
                
                {book.rating && book.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < (book.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Book size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 text-lg mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No books match your search' : 'No books in your library yet'}
            </p>
            <p className="text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start building your reading journal by adding your first book!'
              }
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <button
                onClick={() => setShowAddBook(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Add Your First Book
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumBooks;