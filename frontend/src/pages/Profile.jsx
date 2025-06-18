import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const { id: userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoInput, setPhotoInput] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  const handlePhotoUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/user/${userId}/update-photo-url`,
        { profilePhoto: photoInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profile photo updated!");
      setUserData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          profilePhoto: res.data.profilePhoto,
        },
      }));
      setPhotoInput("");
      setImageError(false);
    } catch (err) {
      console.error("Error updating photo:", err);
      alert("Failed to update profile photo");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found.</div>;

  const { user, tripsCreated = [], tripsJoined = [], blogs = [] } = userData;

  return (
    <div className="profile-container">
      <h1>Profile: {user.name}</h1>

      <div className="profile-header">
        <img
          src={
            user.profilePhoto
              ? `${user.profilePhoto}?t=${Date.now()}`
              : "/default-avatar.png"
          }
          alt="Profile"
          className="profile-photo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-avatar.png";
          }}
        />

        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>

          <div className="profile-photo-upload">
            <input
              type="text"
              placeholder="Enter image URL (ends with .jpg/.png)"
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
            />

            {photoInput && /\.(jpeg|jpg|png|gif|webp)$/i.test(photoInput) ? (
              <img
                src={photoInput}
                alt="Preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  marginTop: "10px",
                  border: "2px solid #ccc",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : photoInput ? (
              <p style={{ color: "red", fontSize: "0.9rem" }}>
                ⚠️ Invalid image URL format
              </p>
            ) : null}

            <button className="upload-label" onClick={handlePhotoUpdate}>
              Update Photo
            </button>
          </div>
        </div>
      </div>

      <h2>Trips Created</h2>
      <div className="card-container">
        {tripsCreated.length > 0 ? (
          tripsCreated.map((trip) => (
            <Link to={`/trip/${trip._id}`} key={trip._id} className="card">
              <h3>{trip.destination}</h3>
              <p>{trip.date}</p>
            </Link>
          ))
        ) : (
          <p>No trips created.</p>
        )}
      </div>

      <h2>Trips Joined</h2>
      <div className="card-container">
        {tripsJoined.length > 0 ? (
          tripsJoined.map((trip) => (
            <Link to={`/trip/${trip._id}`} key={trip._id} className="card">
              <h3>{trip.destination}</h3>
              <p>{trip.date}</p>
            </Link>
          ))
        ) : (
          <p>No trips joined.</p>
        )}
      </div>

      <h2>Blogs</h2>
      <div className="card-container">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="blog-header">
                <img
                  src={
                    blog.author_profile_photo
                      ? `${blog.author_profile_photo}?t=${Date.now()}`
                      : `https://api.dicebear.com/7.x/initials/svg?seed=${
                          blog.author || "User"
                        }`
                  }
                  alt="Avatar"
                  className="blog-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${
                      blog.author || "User"
                    }`;
                  }}
                />
                <div>
                  <h3 className="blog-title">{blog.title}</h3>
                  <p className="blog-meta">
                    by <strong>{blog.author}</strong> •{" "}
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                  <p className="blog-location">📍 {blog.destination}</p>
                </div>
              </div>

              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="blog-main-image"
                />
              )}

              <p className="blog-content">{blog.content}</p>
            </div>
          ))
        ) : (
          <p>No blogs found.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
