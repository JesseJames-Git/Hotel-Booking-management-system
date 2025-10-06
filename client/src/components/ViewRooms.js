import React, { useState, useEffect } from "react";
import "../styling/ViewRooms.css";

const ViewRooms = ({ hotel }) => {
  const [hotelData, setHotelData] = useState({});

  useEffect(() => {
    if (hotel) {
      setHotelData(hotel);
    }
  }, [hotel]);

  if (!hotelData || !hotelData.rooms) {
    return <h3 className="loading-text">No rooms available or still loading...</h3>;
  }

  return (
    <div className="rooms-container">
      <h2 className="rooms-title">Rooms at {hotelData.name}</h2>

      <div className="rooms-grid">
        {hotelData.rooms.map((r) => (
          <div key={r.id} className="room-card">
            <h3 className="room-name">{r.room_name}</h3>

            <p><strong>Price per Night:</strong> ${r.price_per_night}</p>
            <p>
              <strong>Availability:</strong>{" "}
              <span
                className={`availability-badge ${
                  r.is_available ? "available" : "unavailable"
                }`}
              >
                {r.is_available ? "Available" : "Occupied"}
              </span>
            </p>
            <p>
              <strong>Room Type:</strong>{" "}
              {r.room_type
                ? `${r.room_type.type_name} – ${r.room_type.description}`
                : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRooms;
