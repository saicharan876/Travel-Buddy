import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    job: '',
    dob: '',
    password: '',
    confirmPassword: '',
    profilePhoto: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/signup', {
        name: form.name,
        email: form.email,
        college: form.college,
        job: form.job,
        dob: form.dob,
        password: form.password,
        profilePhoto: form.profilePhoto
      });
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-fields">
          <h2>Create an Account</h2>
          {error && <p className="error-message">{error}</p>}

          <label>Name:</label>
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>College:</label>
          <input
            name="college"
            type="text"
            placeholder="College"
            value={form.college}
            onChange={handleChange}
          />

          <label>Job:</label>
          <input
            name="job"
            type="text"
            placeholder="Job"
            value={form.job}
            onChange={handleChange}
          />

          <label>Date of Birth:</label>
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
          />

          <label>Password:</label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password:</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <label htmlFor="profilePhoto">Profile Photo URL:</label>
          <input
            type="text"
            name="profilePhoto"
            id="profilePhoto"
            placeholder="https://example.com/profile.jpg"
            value={form.profilePhoto}
            onChange={handleChange}
          />

          <img
            className="profile-preview"
            src={form.profilePhoto || '/default-avatar.png'}
            alt="Profile Preview"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}
