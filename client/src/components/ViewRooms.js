import React, { useState, useEffect } from "react";

const ViewRooms = ({ hotel }) => {
  const [hotelData, setHotelData] = useState({});

  useEffect(() => {
    if (hotel) {
      setHotelData(hotel);
    }
  }, [hotel]);

  if (!hotelData || !hotelData.rooms) {
    return <h3>No rooms available or still loading...</h3>;
  }

  return (
    <div>
      <h2>Rooms for {hotelData.name}</h2>
      <ul>
        {hotelData.rooms.map((r) => (
          <li key={r.id} style={{ marginBottom: "1em" }}>
            <p><strong>Name: </strong>{r.room_name}</p>
            <p><strong>Price per Night: </strong>{r.price_per_night}</p>
            <p><strong>Is Available: </strong>{r.is_available ? "Yes" : "No"}</p>
            <p><strong>Room Type: </strong>{`${r.room_type?.type_name || ""} - ${r.room_type?.description || ""}`}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewRooms;
