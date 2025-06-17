import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const { id: userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found.</div>;

  const { user, tripsCreated = [], tripsJoined = [], blogs = [] } = userData;

  return (
    <div className="profile-container">
      <h1>Profile: {user.name}</h1>
      <div className="profile-header">
        <img
          src={user.profilePhoto || "/default-avatar.png"}
          alt="Profile"
          className="profile-photo"
        />
        <h1>Profile: {user.name}</h1>
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
            <div key={blog._id} className="card">
              <h3>{blog.title}</h3>
              <p>Destination: {blog.destination}</p>
              <p>{blog.content}</p>
              <p>
                <small>{new Date(blog.createdAt).toLocaleDateString()}</small>
              </p>
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
