import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, ] = useState('');
  const [formError, setFormError] = useState('');

  const { token } = useContext(AuthContext);

 useEffect(() => {
  setBlogs([
    {
      _id: 'test123',
      title: 'Sunset at the Beach',
      content: 'The sunset was magical and the waves added a peaceful rhythm.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60'
    }
  ]);
  setLoading(false);
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

  if (loading) return <div className="loading-message">Loading blogs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="blogs-container">
      <h2 className="blogs-title">Travel Blogs</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        <h3>Share Your Story</h3>
        {formError && <p className="form-error">{formError}</p>}
        <input
          name="title"
          value={form.title}
          placeholder="Blog Title"
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          value={form.content}
          placeholder="Your story..."
          onChange={handleChange}
          required
        />
        <button type="submit">Add Blog</button>
      </form>
      <ul className="blog-list">
        {blogs.map(blog => (
          <li key={blog._id} className="blog-card">
            {blog.image && <img src={blog.image} alt="Blog visual" className="blog-image" />}
            <h4>{blog.title}</h4>
            <p>{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
