import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const AdminEditBook = () => {
  const { id } = useParams();
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
  // we only need the setter; the value isn't rendered anywhere
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/books/${id}`);
      const b = res.data.book;
      setForm({
        title: b.title || '',
        author: b.author || '',
        description: b.description || '',
        genre: b.genre || '',
        publishedYear: b.publishedYear || '',
        imageUrl: b.imageUrl || ''
      });
    } catch (err) {
      console.error('Fetch book for edit failed:', err);
      toast.error('Failed to load book');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchBook();
  }, [user, fetchBook]);

  if (!user || user.role !== 'admin') {
    return <div className="text-center py-12">You are not authorized to view this page.</div>;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setCoverFile(e.target.files?.[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        author: form.author,
        description: form.description,
        genre: form.genre,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear, 10) : undefined,
        imageUrl: form.imageUrl || undefined
      };

      // we don't need the response object; avoiding an unused var
      await axios.put(`/api/books/${id}`, payload);

      if (coverFile) {
        try {
          const fd = new FormData();
          fd.append('cover', coverFile);
          const token = localStorage.getItem('token');
          await axios.post(`/api/books/${id}/upload-cover`, fd, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          });
        } catch (uploadErr) {
          console.error('Cover upload failed during edit:', uploadErr);
          toast.error(uploadErr?.response?.data?.message || 'Cover upload failed');
        }
      }

      toast.success('Book updated successfully');
      navigate(`/books/${id}`);
    } catch (err) {
      console.error('Update book failed:', err);
      const serverData = err?.response?.data;
      toast.error(serverData?.message || serverData?.details || 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Book</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Replace Cover Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={() => navigate(`/books/${id}`)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditBook;
