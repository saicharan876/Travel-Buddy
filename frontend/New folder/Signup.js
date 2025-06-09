import React, { useState } from 'react';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/user/signup', formData);
      alert('Signup successful');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Signup</button>
      </form>
    </div>
  );
}