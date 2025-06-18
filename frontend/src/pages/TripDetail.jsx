import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TripCardImage from "./TripCardImage";
import "./TripDetail.css";
import Chatbox from "../components/Chatbox";
import { AuthContext } from "../context/AuthContext";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, getUserId } = useContext(AuthContext);
  const userId = isAuthenticated && getUserId ? getUserId() : null;

  useEffect(() => {
    axios.get(`http://localhost:5000/trip/${id}`)
      .then(res => setTrip(res.data))
      .catch(() => setError("Failed to load trip"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <><p>{error}</p><Link to="/trips">Back</Link></>;

  const creatorId = trip.creator?._id || trip.creator;
  const isParticipant = trip.participants?.some(
    p => (p._id || p) === userId
  );
  const canViewFull = !trip.blind || creatorId === userId || isParticipant;

  return (
    <div className="trip-detail-page-container">
      <Link to="/trips" className="back-link">← Back</Link>

      <div className="trip-detail-card">
        <TripCardImage query={trip.destination} altText={trip.destination} />
        <div className="trip-detail-content">
          <h1 className="trip-detail-title">{trip.destination}</h1>
          <p><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</p>
          <p>{trip.description}</p>

          {canViewFull ? (
            <>
              <p><strong>Location:</strong> {trip.location}</p>
              <p><strong>Gender Preference:</strong> {trip.genderPreference || "Any"}</p>
              <p><strong>Blind Trip:</strong> {trip.blind ? "Yes" : "No"}</p>
              <p><strong>Creator:</strong> {trip.creator?.name || trip.creator}</p>
              <p><strong>Participants:</strong>{" "}
                {trip.participants && trip.participants.length > 0
                  ? trip.participants.map((p,i) => (
                      <Link key={p._id || p} to={`/user/${p._id || p}`}>
                        {p.name || p}
                      </Link>
                    )).reduce((prev, curr) => [prev, ', ', curr])
                  : "None yet"}
              </p>
            </>
          ) : (
            <p><em>This is a blind trip – full details are hidden until you join.</em></p>
          )}
        </div>
      </div>

      {creatorId === userId && (
        <div className="trip-actions">
          <button className="delete-button" onClick={() => {
            if (window.confirm("Delete this trip?")) axios.delete(`/trip/delete/${id}`, { headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} })
              .then(() => navigate("/trips"));
          }}>🗑️ Delete Trip</button>
        </div>
      )}

      {creatorId !== userId && (
        <div className="join-button-container">
          {!isParticipant ? (
            <button className="join-button" onClick={() => {
              axios.post(`/trip/join/${id}`, {}, { headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} })
                .then(() => setTrip(prev => ({
                  ...prev,
                  participants: [...(prev.participants||[]), userId]
                })));
            }}>✅ Join Trip</button>
          ) : (
            <button className="leave-button" onClick={() => {
              axios.post(`/trip/leave/${id}`, {}, { headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} })
                .then(() => navigate("/trips"));
            }}>❌ Leave Trip</button>
          )}
        </div>
      )}

      {(creatorId === userId || isParticipant) && (
        <div className="chatbox-container">
          <h2>Chat with the Trip Creator</h2>
          <Chatbox tripId={id} userId={userId} receiverId={creatorId} />
        </div>
      )}
    </div>
  );
}
