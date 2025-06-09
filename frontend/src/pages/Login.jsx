import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  
  const from = location.state?.from?.pathname || "/";

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/user/login', form);
      login(res.data.token); // Update context and local storage
      navigate(from, { replace: true }); // Redirect to previous page or home
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 rounded text-center">{error}</p>}
        <input name="email" type="email" placeholder="Email" className="border p-2 w-full rounded" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="border p-2 w-full rounded" onChange={handleChange} required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-300">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}