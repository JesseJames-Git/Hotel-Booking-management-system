import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styling/HotelDetails.css";

const HotelDetails = ({ match }) => {
  const { id } = match.params;
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/hotels/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setHotel(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading hotel details...</p>;
  if (!hotel) return <p className="error">Hotel not found.</p>;

  return (
    <div className="hotel-details">
      <div className="hotel-header">
        <h1>{hotel.name}</h1>
        <p className="location">
          📍 {hotel.city}, {hotel.country}
        </p>
        <p>{hotel.address}</p>
        <p>📞 {hotel.phone}</p>
      </div>

      <div className="details-section">
        <h3>✨ Amenities</h3>
        {hotel.hotel_amenities?.length ? (
          <ul className="amenities-list">
            {hotel.hotel_amenities.map((a) => (
              <li key={a.id}>
                <strong>{a.name}:</strong> {a.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed.</p>
        )}
      </div>

      <div className="details-section">
        <h3>🛏 Rooms</h3>
        {hotel.rooms?.length ? (
          <div className="rooms-grid">
            {hotel.rooms.map((r) => (
              <div key={r.id} className="room-card">
                <h4>{r.room_name}</h4>
                <p>Type: {r.room_type?.type_name}</p>
                <p>
                  💵 <strong>${r.price_per_night}</strong> / night
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No rooms available.</p>
        )}
      </div>

      <div className="actions">
        <Link to="/hotels">
          <button className="btn btn-secondary">⬅ Back to Hotels</button>
        </Link>
        <Link to={`/hotels/${id}/book`}>
          <button className="btn btn-primary">Book Now</button>
        </Link>
      </div>
    </div>
  );
};

export default HotelDetails;
