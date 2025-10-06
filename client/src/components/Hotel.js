import React, { useEffect, useState } from "react";
import "../styling/Hotel.css";

const Hotel = ({ hotel }) => {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    if (!hotel?.id) return;
    fetch(`/hotel/${hotel.id}/amenities`)
      .then((r) => r.json())
      .then((d) => setAmenities(d))
      .catch((err) => console.error("Error fetching amenities:", err));
  }, [hotel]);

  if (!hotel || hotel.message) {
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
