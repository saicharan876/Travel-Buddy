import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/user/signup', form);
      alert('Signup successful! Please log in.'); // Simple notification
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 rounded text-center">{error}</p>}
        <input name="name" placeholder="Full Name" className="border p-2 w-full rounded" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="border p-2 w-full rounded" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="border p-2 w-full rounded" onChange={handleChange} required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-300">
           {loading ? 'Signing up...' : 'Signup'}
        </button>
      </form>
    </div>
  );
}