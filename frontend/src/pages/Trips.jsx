import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Trips.css';
import TripCardImage from './TripCardImage';

const TABS = [
  { id: '/', label: 'All Trips' },
  { id: 'college', label: 'College Trips' },
  { id: 'location', label: 'By Location' },
  { id: 'blind', label: 'Blind Trips' },
  { id: 'create', label: 'Create Trip' },
];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ destination: '', description: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tripsGridRef = useRef(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCollege, setSearchCollege] = useState('');

  useEffect(() => {
    if (activeTab === 'create') return;

    setLoading(true);
    setError(null);

    let apiUrl = 'http://localhost:5000/trip';

    if (activeTab === 'location' && searchLocation.trim()) {
      apiUrl += `?location=${encodeURIComponent(searchLocation)}`;
    } else if (activeTab === 'college' && searchCollege.trim()) {
      apiUrl += `/college?college=${encodeURIComponent(searchCollege)}`;
    } else if (activeTab !== '/' && !['location','college'].includes(activeTab)) {
      apiUrl += `/${activeTab}`;
    }

    axios.get(apiUrl)
      .then(res => setTrips(res.data))
      .catch(() => {
        const label = TABS.find(t => t.id === activeTab)?.label || 'this category';
        setError(`Failed to load trips for ${label}.`);
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab, searchLocation, searchCollege]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/trip/create', form)
      .then(res => {
        setTrips(prev => [res.data.trip, ...prev]);
        setForm({ destination: '', description: '', location: '' });
        setActiveTab('/'); // back to all
      })
      .catch(() => alert('Could not add trip.'));
  };

  const handleLocationSearch = e => {
    e.preventDefault();
    setSearchLocation(form.location);
  };

  const handleCollegeSearch = e => {
    e.preventDefault();
    setSearchCollege(form.location);
  };

  return (
    <div className="trips-page-container">
      <div className="tabs-container">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'location') setSearchLocation('');
              if (tab.id !== 'college') setSearchCollege('');
            }}
          >
            {tab.label} {activeTab === tab.id ? `(${trips.length})` : null}
          </button>
        ))}
      </div>

      {/* CREATE FORM */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="add-trip-form">
          <input name="destination" value={form.destination} placeholder="Venue Name" onChange={handleChange} required />
          <input name="location" value={form.location} placeholder="Location" onChange={handleChange} required />
          <input name="description" value={form.description} placeholder="Description" onChange={handleChange} required />
          <button type="submit">Create Trip</button>
        </form>
      )}

      {/* SEARCH FORMS */}
      {activeTab === 'location' && (
        <form onSubmit={handleLocationSearch} className="location-filter-form">
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
            required
          />
          <button type="submit">Search</button>
        </form>
      )}
      {activeTab === 'college' && (
        <form onSubmit={handleCollegeSearch} className="location-filter-form">
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter college"
            required
          />
          <button type="submit">Search</button>
        </form>
      )}

      {/* TRIP CARDS */}
      {activeTab !== 'create' && (
        <div className="trips-scroll-container">
          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : error ? (
            <div className="error-container">{error}</div>
          ) : trips.length === 0 ? (
            <p className="no-trips-message">No trips found.</p>
          ) : (
            <ul ref={tripsGridRef} className="trips-grid">
              {trips.map(trip => (
                <Link to={`/trip/${trip._id}`} key={trip._id} className="card-link-wrapper">
                  <li className="trip-card">
                    <div className="card-image-container">
                      <TripCardImage query={trip.destination} altText={trip.destination} />
                      <div className="bookable-tag">Bookable</div>
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <h3 className="card-title">{trip.destination}</h3>
                        <div className="card-rating">
                          <i className="fas fa-star" /> 4.8
                        </div>
                      </div>
                      <p className="card-location">{trip.location}</p>
                      <p className="card-description">{trip.description}</p>
                      <div className="card-icons">
                        <i className="fa-solid fa-table-tennis-paddle-ball" />
                        <i className="fa-solid fa-person-swimming" />
                      </div>
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
