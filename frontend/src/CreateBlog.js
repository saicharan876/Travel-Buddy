import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateBlog() {
  const [formData, setFormData] = useState({ title: '', destination: '', content: '', author: '', image: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/blogs/createBlog', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Blog posted successfully!');
      setFormData({ title: '', destination: '', content: '', author: '', image: '' });
    } catch (err) {
      console.error(err);
      setMessage('Failed to post blog.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Post a Travel Blog</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} className="w-full p-2 border rounded" required />
        <textarea name="content" placeholder="Content" value={formData.content} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="author" placeholder="Author" value={formData.author} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="image" placeholder="Image URL (optional)" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Post</button>
      </form>
    </div>
  );
}