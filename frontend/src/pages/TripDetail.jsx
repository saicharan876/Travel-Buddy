import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// We'll create a dedicated CSS file to avoid conflicts
import './TripDetail.css'; 

export default function TripDetail() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  // Store the actual error message for display
  const [error, setError] = useState('');

  const { id } = useParams();

  useEffect(() => {
    // Make sure your backend route matches this exactly!
    axios.get(`http://localhost:5000/trip/${id}`)
      .then(res => {
        setTrip(res.data);
      })
      .catch(err => {
        console.error("Error fetching trip details:", err);
        // Set a more descriptive error message
        if (err.response && err.response.status === 404) {
          setError("Oops! We couldn't find a venue with that ID.");
        } else {
          setError("Failed to load venue details. Please check the server connection.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // This loading state is now very obvious
  if (loading) {
    return <div className="status-container"><h2>Loading Venue Details...</h2></div>;
  }

  // This error state is also very obvious
  if (error) {
    return (
      <div className="status-container error-container">
        <h2>Something Went Wrong</h2>
        <p>{error}</p>
        <Link to="/trips" className="back-link">Go Back to All Venues</Link>
      </div>
    );
  }

  return (
    <div className="trip-detail-page-container">
      <Link to="/trips" className="back-link">
        <i className="fa-solid fa-arrow-left"></i>
        Back to All Venues
      </Link>
      
      {/* This part only renders if 'trip' is successfully fetched */}
      {trip && (
        <div className="trip-detail-card">
          <img className="trip-detail-image" src={`https://picsum.photos/seed/${trip._id}/800/400`} alt={trip.destination} />
          <div className="trip-detail-content">
            <h1 className="trip-detail-title">{trip.destination}</h1>
            <p className="trip-detail-location">{trip.location}</p>
            <p className="trip-detail-description">{trip.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}