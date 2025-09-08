import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const AdminCreateBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    publishedYear: '',
    imageUrl: ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    return <div className="text-center py-12">You are not authorized to view this page.</div>;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setCoverFile(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Client-side validation for publishedYear
      if (form.publishedYear) {
        const py = parseInt(form.publishedYear, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(py) || py < 1000 || py > currentYear) {
          toast.error(`Published year must be between 1000 and ${currentYear}`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        title: form.title,
        author: form.author,
        description: form.description,
        genre: form.genre,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear, 10) : undefined,
        imageUrl: form.imageUrl || undefined
      };

      const res = await axios.post('/api/books', payload);
      const created = res.data.book;

      if (coverFile) {
        try {
          const fd = new FormData();
          fd.append('cover', coverFile);
          const token = localStorage.getItem('token');
          await axios.post(`/api/books/${created._id}/upload-cover`, fd, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          });
        } catch (uploadErr) {
          console.error('Cover upload failed:', uploadErr);
          const uploadMsg = uploadErr?.response?.data?.message || uploadErr?.message || 'Cover upload failed';
          toast.error(uploadMsg);
        }
      }

      toast.success('Book created successfully');
      navigate(`/books/${created._id}`);
    } catch (err) {
      const serverData = err?.response?.data;
      let msg = 'Failed to create book';
      if (serverData) {
        if (serverData.message) msg = serverData.message;
        else if (serverData.errors && Array.isArray(serverData.errors)) {
          msg = serverData.errors.map(e => e.msg || e.message).join(', ');
        } else if (serverData.details) msg = serverData.details;
      } else if (err.message) msg = err.message;
      console.error('Create book error:', err, serverData);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Book</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input-field w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
          <input name="author" value={form.author} onChange={handleChange} required className="input-field w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={6} className="input-field w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <input name="genre" value={form.genre} onChange={handleChange} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
            <input name="publishedYear" value={form.publishedYear} onChange={handleChange} className="input-field w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (optional)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/cover.jpg" className="input-field w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Book'}
          </button>
          <button type="button" onClick={() => navigate('/books')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateBook;
