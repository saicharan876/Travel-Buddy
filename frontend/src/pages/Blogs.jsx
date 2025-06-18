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

        <div className="blog-grid">
          <div className="blog-form-wrapper">
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
          </div>

          <div className="blog-list-wrapper">
            <div className="blog-list">
              {blogs.map((blog) => (
                <article key={blog._id} className="blog-card">
                  <div className="blog-header">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.author || "User"}`}
                      alt="Avatar"
                      className="blog-avatar"
                    />
                    <div className="blog-meta">
                      <h4>{blog.title}</h4>
                      <p className="blog-author">
                        by {blog.author} &middot;{" "}
                        <span className="blog-date">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="blog-destination">📍 {blog.destination}</p>
                    </div>
                  </div>

                  {blog.image && (
                    <img
                      src={blog.image || "/default-travel.jpg"}
                      alt={blog.title}
                      className="blog-image"
                    />
                  )}
                  <p>{blog.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
