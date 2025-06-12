import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import TripCardImage from './TripCardImage';
import './TripDetail.css'; 

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/trip/${id}`)
      .then((res) => {
        setTrip(res.data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load trip details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading trip details...</p>;
  if (error)
    return (
      <>
        <p>{error}</p>
        <Link to="/trips">Back to trips</Link>
      </>
    );

  const formattedDate = trip.date
    ? new Date(trip.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date not specified";

  return (
    <div className="trip-detail-page-container">
      <Link to="/trips" className="back-link">
        ← Back to All Venues
      </Link>

      <div className="trip-detail-card">
        <TripCardImage query={trip.destination} altText={trip.destination} />

        <div className="trip-detail-content">
          <h1 className="trip-detail-title">{trip.destination}</h1>
          <p>
            <strong>Location:</strong> {trip.location}
          </p>
          <p>{trip.description}</p>

          <p>
            <strong>Date:</strong> {formattedDate}
          </p>
          <p>
            <strong>Gender Preference:</strong>{" "}
            {trip.genderPreference || "No preference"}
          </p>
          <p>
            <strong>Blind Trip:</strong> {trip.blind ? "Yes" : "No"}
          </p>
          <p>
            <strong>Creator:</strong> {trip.creator?.name || trip.creator || "Not available"}
          </p>
          <p>
            <strong>Participants:</strong>{" "}
            {trip.participants && trip.participants.length > 0
              ? trip.participants.map((p) => p.name || p).join(", ")
              : "No participants yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
