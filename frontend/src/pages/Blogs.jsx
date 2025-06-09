import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios.get('http://localhost:5000/blogs')
      .then(res => {
        setBlogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch blogs.');
        setLoading(false);
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setFormError('');

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    axios.post('http://localhost:5000/blogs', form, config)
      .then(res => {
        setBlogs(prevBlogs => [...prevBlogs, res.data.blog]);
        setForm({ title: '', content: '' });
      })
      .catch(err => {
        console.error(err);
        setFormError(err.response?.data?.message || 'Failed to add blog. Please try again.');
      });
  };

  if (loading) return <div className="p-4 text-center">Loading blogs...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Travel Blogs</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-md space-y-3">
        <h3 className="text-xl font-semibold">Share Your Story</h3>
        {formError && <p className="text-red-500 bg-red-100 p-2 rounded">{formError}</p>}
        <input name="title" value={form.title} placeholder="Blog Title" className="border p-2 w-full rounded" onChange={handleChange} required />
        <textarea name="content" value={form.content} placeholder="Your story..." className="border p-2 w-full h-32 rounded" onChange={handleChange} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Blog</button>
      </form>
      <ul className="space-y-4">
        {blogs.map(blog => (
          <li key={blog._id} className="border p-4 rounded-lg shadow">
            <h4 className="text-xl font-bold">{blog.title}</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}