import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TripCardImage from "./TripCardImage";
import "./TripDetail.css";
import Chatbox from "../components/Chatbox";
import { AuthContext } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const { isAuthenticated, getUserId } = useContext(AuthContext);
  const userId = isAuthenticated && getUserId ? getUserId() : null;

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

  useEffect(() => {
    if (trip?.destination) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            trip.destination
          )}&format=json&limit=1`
        )
        .then((res) => {
          if (res.data.length > 0) {
            const { lat, lon } = res.data[0];
            setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
          }
        })
        .catch((err) => {
          console.error("Geocoding error:", err);
        });
    }
  }, [trip?.destination]);

  const handleDeleteTrip = (tripId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    axios
      .delete(`http://localhost:5000/trip/delete/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Trip deleted successfully.");
        navigate("/trips");
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("Failed to delete trip.");
      });
  };

  const handleJoinTrip = async (tripId) => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !token) {
      alert("You must be logged in to join a trip.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/trip/join/${tripId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Successfully joined the trip!");
      setTrip((prev) => ({
        ...prev,
        participants: [...(prev.participants || []), userId],
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to join the trip.";
      alert(errorMessage);
      console.error(errorMessage);
    }
  };

  const handleLeaveTrip = (tripId) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `http://localhost:5000/trip/leave/${tripId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        alert("You have left the trip.");
        navigate("/trips");
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("Failed to leave trip.");
      });
  };

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

  const creatorId = trip.creator?._id || trip.creator;
  const isParticipant = trip.participants?.some(
    (p) => (typeof p === "object" ? p._id : p) === userId
  );

  return (
    <>
      {/* Map at Top - Elliptical Clipped */}
     <div className="trip-map-floating-bottom">
      <div className="trip-map-ellipse">
        {coords && (
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={14}
            className="leaflet-container"
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={false}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>{trip.destination}</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>

      {/* Trip Details Container */}
      <div className="trip-detail-page-container">
        <div className="trip-detail-card">
          <div className="trip-detail-content">
            <Link to="/trips" className="back-link">
              ← Back to All Trips
            </Link>

            <TripCardImage
              query={trip.destination}
              altText={trip.destination}
            />

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
              <strong>Creator:</strong>{" "}
              {trip.creator?.name || trip.creator || "Not available"}
            </p>
            <p>
              <strong>Participants:</strong>{" "}
              {trip.participants?.length > 0
                ? trip.participants.map((p, idx) => (
                    <span key={p._id || p}>
                      <Link
                        to={`/user/${p._id || p}`}
                        style={{
                          color: "#4f46e5",
                          textDecoration: "underline",
                        }}
                      >
                        {p.name || p}
                      </Link>
                      {idx !== trip.participants.length - 1 && ", "}
                    </span>
                  ))
                : "No participants yet"}
            </p>

            {userId && creatorId === userId && (
              <div className="trip-actions">
                <button
                  onClick={() => navigate(`/trip/edit/${trip._id}`)}
                  className="edit-button"
                >
                  ✏️ Edit Trip
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip._id)}
                  className="delete-button"
                >
                  🗑️ Delete Trip
                </button>
              </div>
            )}

            {userId && creatorId !== userId && (
              <div className="join-button-container">
                {!isParticipant ? (
                  <button
                    className="join-button"
                    onClick={() => handleJoinTrip(trip._id)}
                  >
                    ✅ Join Trip
                  </button>
                ) : (
                  <button
                    className="leave-button"
                    onClick={() => handleLeaveTrip(trip._id)}
                  >
                    ❌ Leave Trip
                  </button>
                )}
              </div>
            )}

            {userId && (creatorId === userId || isParticipant) && (
              <div className="chatbox-container">
                <h2>Chat</h2>
                <Chatbox
                  tripId={trip._id}
                  userId={userId}
                  receiverId={creatorId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
