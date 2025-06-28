import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Trips.css";
import TripCardImage from "./TripCardImage";
import video from "./Generated File June 13, 2025 - 10_53PM.mp4";
import { AuthContext } from "../context/AuthContext.jsx";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TABS = [
  { id: "/", label: "All Trips" },
  { id: "college", label: "College Trips" },
  { id: "location", label: "By Location" },
  { id: "blind", label: "Blind Trips" },
  { id: "create", label: "Create Trip" },
];

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [coordsList, setCoordsList] = useState([]);
  const { isAuthenticated, getUserId, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningTripId, setJoiningTripId] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCollege, setSearchCollege] = useState("");

  const userId = useMemo(
    () => (isAuthenticated && typeof getUserId === "function" ? getUserId() : null),
    [isAuthenticated, getUserId]
  );

  useEffect(() => {
    if (activeTab === "create") return;
    setLoading(true);
    setError(null);
    let apiUrl = "http://localhost:5000/trip";
    if (activeTab === "location" && searchLocation.trim()) {
      apiUrl += `?location=${encodeURIComponent(searchLocation)}`;
    } else if (activeTab === "college" && searchCollege.trim()) {
      apiUrl += `/college?college=${encodeURIComponent(searchCollege)}`;
    } else if (!["/", "location", "college"].includes(activeTab)) {
      apiUrl += `/${activeTab}`;
    }
    axios
      .get(apiUrl)
      .then((res) => setTrips(res.data))
      .catch(() => {
        setError("Failed to load trips.");
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab, searchLocation, searchCollege]);

  useEffect(() => {
    if (!trips.length) {
      setCoordsList([]);
      return;
    }
    const fetchCoords = async () => {
      const results = await Promise.all(
        trips.map(async (trip) => {
          try {
            const resp = await axios.get(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                trip.destination
              )}&format=json&limit=1`
            );
            if (resp.data.length) {
              const { lat, lon } = resp.data[0];
              return {
                id: trip._id,
                lat: parseFloat(lat),
                lng: parseFloat(lon),
                name: trip.destination,
              };
            }
          } catch {
            return null;
          }
          return null;
        })
      );
      setCoordsList(results.filter((r) => r));
    };
    fetchCoords();
  }, [trips]);

  const handleJoinTrip = async (tripId) => {
    if (!isAuthenticated || !token) {
      alert("You must be logged in to join a trip.");
      return;
    }
    setJoiningTripId(tripId);
    try {
      await axios.post(
        `http://localhost:5000/trip/join/${tripId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Successfully joined the trip!");
      setTrips((prev) =>
        prev.map((t) =>
          t._id === tripId
            ? { ...t, participants: [...(t.participants || []), userId] }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to join the trip.");
    } finally {
      setJoiningTripId(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      alert("Login required.");
      return;
    }
    const form = e.target;
    const data = {
      destination: form.destination.value,
      location: form.location.value,
      description: form.description.value,
      date: form.date.value,
      college: form.college.value,
      genderPreference: form.genderPreference.value,
      blind: form.blind.checked,
      creator: userId,
    };
    axios
      .post("http://localhost:5000/trip/create", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTrips((prev) => [res.data.trip, ...prev]);
        setActiveTab("/");
      })
      .catch((err) => {
        console.error(err);
        alert("Could not create trip.");
      });
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    setSearchLocation(e.target.location.value);
  };

  const handleCollegeSearch = (e) => {
    e.preventDefault();
    setSearchCollege(e.target.college.value);
  };

  return (
    <div className="main_container">
      <div className="trips-page-container">
        <div className="tabs-container">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "location") setSearchLocation("");
                if (tab.id !== "college") setSearchCollege("");
              }}
            >
              {tab.label} {activeTab === tab.id ? `(${trips.length})` : null}
            </button>
          ))}
        </div>

        {activeTab === "create" && (
          <form className="add-trip-form" onSubmit={handleSubmit}>
            <input name="destination" placeholder="Venue Name" required />
            <input name="location" placeholder="Location" required />
            <input name="description" placeholder="Description" required />
            <input name="college" placeholder="College Name" required />
            <input type="date" name="date" required />
            <select name="genderPreference">
              <option value="">Select Gender Preference</option>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label>
              Blind Trip:
              <input type="checkbox" name="blind" />
            </label>
            <button type="submit">Create Trip</button>
          </form>
        )}

        {activeTab === "location" && (
          <form className="search-container" onSubmit={handleLocationSearch}>
            <input name="location" placeholder="Enter location" required />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        )}
        {activeTab === "college" && (
          <form className="search-container" onSubmit={handleCollegeSearch}>
            <input name="college" placeholder="Enter college" required />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        )}

        {activeTab !== "create" && (
          <div className="trips-scroll-container">
            {loading ? (
              <div className="loading-container">Loading...</div>
            ) : error ? (
              <div className="error-container">{error}</div>
            ) : trips.length === 0 ? (
              <p className="no-trips-message">No trips found.</p>
            ) : (
              <ul className="trips-grid">
                {trips.map((trip) => (
                  <li key={trip._id} className="trip-card">
                    <Link to={`/trip/${trip._id}`} className="card-link-wrapper">
                      <div className="card-image-container">
                        <TripCardImage query={trip.destination} altText={trip.destination} />
                      </div>
                      <div className="card-content">
                        <h3 className="card-title">{trip.destination}</h3>
                        <p className="card-location">{trip.location}</p>
                        <p className="card-description">
                          {trip.description.split(" ").slice(0, 20).join(" ")}
                          {trip.description.split(" ").length > 10 && "..."}
                        </p>
                      </div>
                    </Link>
                    <button
                      className="join-trip-btn"
                      disabled={joiningTripId === trip._id}
                      onClick={() => handleJoinTrip(trip._id)}
                    >
                      {joiningTripId === trip._id ? "Joining..." : "Join"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!loading && coordsList.length > 0 && (
          <div className="trips-map-inline">
            <MapContainer
              bounds={coordsList.map((c) => [c.lat, c.lng])}
              style={{ width: "100%", height: "400px" }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
              {coordsList.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  eventHandlers={{ click: () => navigate(`/trip/${c.id}`) }}
                >
                  <Popup>{c.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
