import React, { useState } from 'react';
import axios from 'axios';

const AddBook = () => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    publishedYear: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    let imageUrl = '';
    if (form.image) {
      // Upload image to Cloudinary
      const data = new FormData();
      data.append('file', form.image);
      data.append('upload_preset', 'bookreview_unsigned');
      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/dxnxnpmyb/image/upload`,
          data
        );
        imageUrl = res.data.secure_url;
      } catch (err) {
        setMessage('Image upload failed');
        return;
      }
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/books`, {
        title: form.title,
        author: form.author,
        description: form.description,
        genre: form.genre,
        publishedYear: form.publishedYear,
        imageUrl,
      });
      setMessage('Book added successfully!');
      setForm({ title: '', author: '', description: '', genre: '', publishedYear: '', image: null });
      setImagePreview(null);
    } catch (err) {
      setMessage('Failed to add book');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add a New Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full mb-2 p-2 border rounded" required />
        <input name="author" value={form.author} onChange={handleChange} placeholder="Author" className="w-full mb-2 p-2 border rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full mb-2 p-2 border rounded" required />
        <input name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" className="w-full mb-2 p-2 border rounded" required />
        <input name="publishedYear" value={form.publishedYear} onChange={handleChange} placeholder="Published Year" type="number" className="w-full mb-2 p-2 border rounded" required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full mb-2" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mb-2 h-32 object-cover" />}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Book</button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default AddBook;
