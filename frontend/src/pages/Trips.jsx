import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ destination: '', description: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios.get('http://localhost:5000/trips')
      .then(res => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch trips.');
        setLoading(false);
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setFormError('');

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    axios.post('http://localhost:5000/trips', form, config)
      .then(res => {
        // Add the new trip to the state instead of reloading
        setTrips(prevTrips => [...prevTrips, res.data.trip]);
        // Reset form
        setForm({ destination: '', description: '', location: '' });
      })
      .catch(err => {
        console.error(err);
        setFormError(err.response?.data?.message || 'Failed to add trip. Please try again.');
      });
  };

  if (loading) return <div className="p-4 text-center">Loading trips...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">All Trips</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-md space-y-3">
        <h3 className="text-xl font-semibold">Add a New Trip</h3>
        {formError && <p className="text-red-500 bg-red-100 p-2 rounded">{formError}</p>}
        <input name="destination" value={form.destination} placeholder="Destination" className="border p-2 w-full rounded" onChange={handleChange} required />
        <input name="description" value={form.description} placeholder="Description" className="border p-2 w-full rounded" onChange={handleChange} required />
        <input name="location" value={form.location} placeholder="Location (e.g., Paris, France)" className="border p-2 w-full rounded" onChange={handleChange} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Trip</button>
      </form>
      <ul className="space-y-4">
        {trips.map(trip => (
          <li key={trip._id} className="border p-4 rounded-lg shadow">
            <h4 className="text-xl font-bold">{trip.destination}</h4>
            <p className="text-gray-700">{trip.description}</p>
            <p className="text-gray-500 text-sm mt-2">{trip.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}