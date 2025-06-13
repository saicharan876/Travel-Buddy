import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    destination: '',
    content: '',
    author: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const { token } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError('');

    axios.get('http://localhost:5000/blogs')
      .then(res => {
        setBlogs(res.data.blogs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setFormError('');

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    axios.post('http://localhost:5000/blogs/createBlog', form, config)
      .then(res => {
        setBlogs(prev => [...prev, form]);
        setForm({
          title: '',
          destination: '',
          content: '',
          author: '',
          image: ''
        });
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
        <input
          name="destination"
          value={form.destination}
          placeholder="Destination"
          onChange={handleChange}
          required
        />
        <input
          name="author"
          value={form.author}
          placeholder="Author Name"
          onChange={handleChange}
          required
        />
        <input
          name="image"
          value={form.image}
          placeholder="Image URL (optional)"
          onChange={handleChange}
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
        {blogs.map((blog, index) => (
          <li key={blog._id || index} className="blog-card">
            {blog.image && (
              <img src={blog.image} alt="Blog visual" className="blog-image" />
            )}
            <h4>{blog.title}</h4>
            <p><strong>Destination:</strong> {blog.destination}</p>
            <p><strong>By:</strong> {blog.author}</p>
            <p>{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
