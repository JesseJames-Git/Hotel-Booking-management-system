import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styling/ViewHotels.css"

const ViewHotels = ({ hotels }) => {
  const [search, setSearch] = useState("");

  const filteredHotels = hotels.filter((h) =>
    `${h.name} ${h.city} ${h.country}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="hotels-container">
      <h1 className="title">🏨 Hotels</h1>
      <p className="subtitle">Browse through all available hotels and book your stay.</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, city, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="hotels-grid">
        {filteredHotels.length === 0 ? (
          <p className="no-results">No hotels found matching your search.</p>
        ) : (
          filteredHotels.map((h) => (
            <div key={h.id} className="hotel-card">
              <h2>{h.name}</h2>
              <p><strong>📍 Location:</strong> {h.city}, {h.country}</p>
              <p><strong>🏠 Address:</strong> {h.address}</p>
              <p><strong>📧 Email:</strong> {h.email}</p>
              <p><strong>📞 Phone:</strong> {h.phone}</p>
              <div className="card-actions">
                <Link to={`/hotels/${h.id}`}>
                  <button className="btn btn-blue">View Details</button>
                </Link>
                <Link to={`/hotels/${h.id}/book`}>
                  <button className="btn btn-green">Book Now</button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewHotels;
