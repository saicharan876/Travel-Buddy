import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios';
import './Trips.css'; // The CSS file we'll create next

export default function Trips() {
  // State for storing the list of trips from the backend
  const [trips, setTrips] = useState([]);
  // State for managing the form inputs
  const [form, setForm] = useState({ destination: '', description: '', location: '' });
  // State to handle loading and error UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // A ref for the grid (can be used for other purposes if needed)
  const tripsGridRef = useRef(null);

  // Fetch initial data from the backend when the component loads
  useEffect(() => {
    // Note: Using your updated backend route /trip
    axios.get('http://localhost:5000/trip')
      .then(res => {
        setTrips(res.data);
      })
      .catch(err => {
        console.error("Error fetching trips:", err);
        setError("Failed to load venues. Please ensure the backend server is running.");
      })
      .finally(() => {
        setLoading(false); // Hide loading message regardless of success or error
      });
  }, []); // The empty array ensures this effect runs only once

  // Update form state as the user types
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle the form submission to create a new trip
  const handleSubmit = e => {
    e.preventDefault();
    // Note: Using your updated backend route /trip/create
    axios.post('http://localhost:5000/trip/create', form)
      .then(res => {
        // Add the new trip to the top of the list for instant UI feedback
        setTrips(prevTrips => [res.data.trip, ...prevTrips]);
        // Clear the form fields
        setForm({ destination: '', description: '', location: '' });
      })
      .catch(err => {
        console.error("Failed to add trip:", err);
        alert("Could not add the venue. Please check the console for errors.");
      });
  };

  // Show a loading message while fetching data
  if (loading) {
    return <div className="loading-container">Loading Venues...</div>;
  }

  // Show an error message if the fetch failed
  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="trips-page-container">
      <h1 className="page-header">Available Venues</h1>
      <p className="page-subheader">Discover and book amazing places for your next trip.</p>

      {/* Form for adding new venues */}
      <form onSubmit={handleSubmit} className="add-trip-form">
        <input name="destination" value={form.destination} placeholder="Venue Name (e.g., The Street)" onChange={handleChange} required />
        <input name="location" value={form.location} placeholder="Location (e.g., Hanumakonda, ~1.0 km)" onChange={handleChange} required />
        <input name="description" value={form.description} placeholder="A short description..." onChange={handleChange} required />
        <button type="submit">Add Venue</button>
      </form>

      {/* This container will hold the grid and have its own scrollbar */}
      <div className="trips-scroll-container">
        {trips.length === 0 ? (
          // Message shown inside the scroll container if there are no trips
          <p className="no-trips-message">No venues found. Add one using the form above!</p>
        ) : (
          <ul ref={tripsGridRef} className="trips-grid">
            {trips.map(trip => (
              <Link to={`/trips/${trip._id}`} key={trip._id} className="card-link-wrapper">
                <li className="trip-card">
                  <div className="card-image-container">
                    <img src={`https://picsum.photos/seed/${trip.location}/400/200`} alt={trip.destination} />
                    <div className="bookable-tag">Bookable</div>
                  </div>
                  <div className="card-content">
                    <div className="card-header">
                      <h3 className="card-title">{trip.destination}</h3>
                      <div className="card-rating">
                        <i className="fas fa-star"></i>
                        <span>4.8 (12)</span>
                      </div>
                    </div>
                    <p className="card-location">{trip.location}</p>
                    <p className="card-description">{trip.description}</p>
                    <div className="card-icons">
                      <i className="fa-solid fa-table-tennis-paddle-ball" title="Table Tennis"></i>
                      <i className="fa-solid fa-person-swimming" title="Swimming"></i>
                      <span>+ 2 more</span>
                    </div>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}