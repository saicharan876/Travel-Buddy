import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TripMap = ({ lat, lng, destination }) => {
  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  if (!lat || !lng) {
    return (
      <p style={{ color: "gray", marginTop: "10px" }}>
        Map unavailable: location coordinates missing.
      </p>
    );
  }

  return (
    <div className="trip-map-wrapper" style={{ marginTop: "20px" }}>
      <h2>📍 Trip Location on Map</h2>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>{destination}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default TripMap;
