import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./EditTrip.css"

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    destination: "",
    location: "",
    description: "",
    college: "",
    date: "",
    genderPreference: "",
    blind: false,
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/trip/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const trip = res.data;
        setForm({
          destination: trip.destination || "",
          location: trip.location || "",
          description: trip.description || "",
          college: trip.college || "",
          date: trip.date ? new Date(trip.date).toISOString().split("T")[0] : "",
          genderPreference: trip.genderPreference || "",
          blind: trip.blind || false,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch trip:", err.response?.data || err.message);
        alert("Failed to fetch trip details.");
        navigate("/trips");
      });
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5000/trip/edit/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Trip updated successfully.");
        navigate(`/trip/${id}`);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("Failed to update trip.");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="add-trip-form">
      <input
        name="destination"
        value={form.destination}
        placeholder="Venue Name"
        onChange={handleChange}
        required
      />
      <input
        name="location"
        value={form.location}
        placeholder="Location"
        onChange={handleChange}
        required
      />
      <input
        name="description"
        value={form.description}
        placeholder="Description"
        onChange={handleChange}
        required
      />
      <input
        name="college"
        value={form.college}
        placeholder="College Name"
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        placeholder="Date"
        required
      />
      <select
        name="genderPreference"
        value={form.genderPreference}
        onChange={(e) =>
          setForm({ ...form, genderPreference: e.target.value })
        }
      >
        <option value="">Select Gender Preference</option>
        <option value="Any">Any</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <label>
        Blind Trip:
        <input
          type="checkbox"
          checked={form.blind}
          onChange={(e) => setForm({ ...form, blind: e.target.checked })}
        />
      </label>
      <button type="submit">Update Trip</button>
    </form>
  );
}
