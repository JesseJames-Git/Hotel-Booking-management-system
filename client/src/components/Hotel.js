import React, { useEffect, useState } from "react";
import "../styling/Hotel.css";

const Hotel = ({ hotel }) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hotel || !hotel.id) {
      setLoading(false);
      return;
    }

    fetch(`/api/hotel/${hotel.id}/amenities`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch amenities");
        return r.json();
      })
      .then((data) => setAmenities(data))
      .catch((err) => console.error("Error fetching amenities:", err))
      .finally(() => setLoading(false));
  }, [hotel]);

  if (loading) {
    return <p className="loading-box">Loading hotel details...</p>;
  }

  if (!hotel || !hotel.id || hotel.message) {
    return <p className="error-box">No hotel found for this admin.</p>;
  }

  return (
    <div className="hotel-container">
      <div className="hotel-header">
        <h2>{hotel.name}</h2>
        <p className="subtitle">Hotel Overview</p>
      </div>

      <div className="hotel-details">
        <p><strong>Email:</strong> {hotel.email}</p>
        <p><strong>Phone:</strong> {hotel.phone}</p>
        <p><strong>City:</strong> {hotel.city}</p>
        <p><strong>Country:</strong> {hotel.country}</p>
        <p className="address"><strong>Address:</strong> {hotel.address}</p>
      </div>

      <div className="amenities-section">
        <h3>Amenities Offered</h3>
        {amenities.length > 0 ? (
          <ul className="amenities-list">
            {amenities.map((a) => (
              <li key={a.id} className="amenity-card">
                <p className="amenity-name">{a.name}</p>
                <p className="amenity-description">{a.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-amenities">No amenities added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Hotel;
