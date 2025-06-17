import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Blogs.css";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const { isAuthenticated, getUserId, token } = useContext(AuthContext);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlogs = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const id = isAuthenticated && getUserId ? getUserId() : null;

    if (!id) {
      setFormError("User not authenticated");
      setIsSubmitting(false);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const blogData = {
      ...form,
      author_Id: id,
    };

    axios
      .post("http://localhost:5000/blogs/createBlog", blogData, config)
      .then(() => {
        setForm({
          title: "",
          destination: "",
          content: "",
          author: "",
          image: "",
        });

        
        fetchBlogs();

      })
      .catch((err) => {
        console.error(err);
        setFormError(
          err.response?.data?.message || "Failed to add blog. Please try again."
        );
      })
      .finally(() => {
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
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Blog..." : "Add Blog"}
          </button>
        </form>

        <ul className="blog-list">
          {blogs.map((blog) => (
            <li key={blog._id} className="blog-card">
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-image" />
              )}
              <h4>{blog.title}</h4>
              <p><strong>Destination:</strong> {blog.destination}</p>
              <p><strong>Author:</strong> {blog.author}</p>
              <p>{blog.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
