import React, { useEffect, useState, useContext } from "react";
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
  { id: "match", label: "Find Matches" },
  { id: "blind", label: "Blind Trips" },
  { id: "create", label: "Create Trip" },
];

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [coordsList, setCoordsList] = useState([]);
  const { isAuthenticated, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningTripId, setJoiningTripId] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCollege, setSearchCollege] = useState("");
  const [matchQuery, setMatchQuery] = useState(null);


  useEffect(() => {
    if (activeTab === "create") return;
    if (activeTab === "match" && !matchQuery) {
      setTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let apiUrl = "http://localhost:5000/trip";
    if (activeTab === "match") {
      apiUrl += `/match?${new URLSearchParams(matchQuery).toString()}`;
    } else if (activeTab === "location" && searchLocation.trim()) {
      apiUrl += `?location=${encodeURIComponent(searchLocation)}`;
    } else if (activeTab === "college" && searchCollege.trim()) {
      apiUrl += `/college?college=${encodeURIComponent(searchCollege)}`;
    } else if (!["/", "location", "college"].includes(activeTab)) {
      apiUrl += `/${activeTab}`;
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(apiUrl, { headers })
      .then((res) => setTrips(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load trips.");
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab, searchLocation, searchCollege, matchQuery, token]);

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
            ? { ...t, isParticipant: true, participantCount: (t.participantCount || 0) + 1 }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join the trip.");
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
      endDate: form.endDate.value || undefined,
      college: form.college.value,
      genderPreference: form.genderPreference.value,
      blind: form.blind.checked,
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
        alert(err.response?.data?.message || "Could not create trip.");
      });
  };

  const handleMatchSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const query = {
      start: form.start.value,
      end: form.end.value,
    };
    if (form.location.value.trim()) {
      query.location = form.location.value.trim();
    }
    if (form.goal.value.trim()) {
      query.goal = form.goal.value.trim();
    }
    setMatchQuery(query);
  };

  const formatShortDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const tripDates = (trip) => {
    if (!trip.date) {
      return "";
    }
    if (trip.endDate && trip.endDate !== trip.date) {
      return formatShortDate(trip.date) + " - " + formatShortDate(trip.endDate);
    }
    return formatShortDate(trip.date);
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
                if (tab.id !== "match") setMatchQuery(null);
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
            <label>
              Start date:
              <input type="date" name="date" required />
            </label>
            <label>
              End date (optional):
              <input type="date" name="endDate" />
            </label>
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
        {activeTab === "match" && (
          <form className="search-container match-form" onSubmit={handleMatchSearch}>
            <input name="location" placeholder="Where do you want to go? (optional)" />
            <label>
              From:
              <input type="date" name="start" required />
            </label>
            <label>
              To:
              <input type="date" name="end" required />
            </label>
            <input name="goal" placeholder="Trip goal, e.g. trek (optional)" />
            <button type="submit" className="search-btn">
              Find Matches
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
            ) : activeTab === "match" && !matchQuery ? (
              <p className="no-trips-message">
                Enter your dates (and a place or goal if you like) to find trips that overlap with your plans.
              </p>
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
                        <p className="card-dates">{tripDates(trip)}</p>
                        {trip.overlapDays !== undefined && (
                          <p className="overlap-badge">
                            {trip.overlapDays} day{trip.overlapDays === 1 ? "" : "s"} overlap with your dates
                          </p>
                        )}
                        <p className="card-description">
                          {(trip.description || "").split(" ").slice(0, 20).join(" ")}
                          {(trip.description || "").split(" ").length > 20 && "..."}
                        </p>
                      </div>
                    </Link>
                    {trip.isCreator ? (
                      <button className="join-trip-btn" disabled>
                        Your trip
                      </button>
                    ) : trip.isParticipant ? (
                      <button className="join-trip-btn" disabled>
                        Joined
                      </button>
                    ) : (
                      <button
                        className="join-trip-btn"
                        disabled={joiningTripId === trip._id}
                        onClick={() => handleJoinTrip(trip._id)}
                      >
                        {joiningTripId === trip._id ? "Joining..." : "Join"}
                      </button>
                    )}
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
