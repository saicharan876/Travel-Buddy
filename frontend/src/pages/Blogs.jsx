// --- Blogs.js ---

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Blogs.css";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    content: "",
    author: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling button

  const { token } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError("");

    axios
      .get("http://localhost:5000/blogs")
      .then((res) => {
        setBlogs(res.data.blogs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load blogs. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .post("http://localhost:5000/blogs/createBlog", form, config)
      .then((res) => {
        // IMPROVEMENT: Use the new blog object from the server response
        // This ensures you get the database _id
        // Make sure your backend API returns the newly created blog object
        const newBlogFromServer = res.data.newBlog || res.data;
        setBlogs((prev) => [...prev, newBlogFromServer]);

        // Reset the form
        setForm({
          title: "",
          destination: "",
          content: "",
          author: "",
          image: "",
        });
      })
      .catch((err) => {
        console.error(err);
        setFormError(
          err.response?.data?.message || "Failed to add blog. Please try again."
        );
      })
      .finally(() => {
        // Re-enable the button after the request is complete
        setIsSubmitting(false);
      });
  };

  if (loading) return <div className="loading-message">Loading blogs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="background_blogs">
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
          {/* IMPROVEMENT: Disable button on submit and change text */}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Blog..." : "Add Blog"}
          </button>
        </form>

        <ul className="blog-list">
          {blogs.map((blog) => (
            // IMPROVEMENT: Use the stable _id from the database as the key
            <li key={blog._id} className="blog-card">
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-image" />
              )}
              <h4>{blog.title}</h4>
              <p>
                <strong>Destination:</strong> {blog.destination}
              </p>
              <p>
                <strong>By:</strong> {blog.author}
              </p>
              <p>{blog.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
