import React, { useEffect, useState } from "react";

function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rooms")
      .then((res) => res.json())
      .then(setRooms);
  }, []);

  function updateAvailability(id, available) {
    fetch(`http://127.0.0.1:5000/rooms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available }),
    })
      .then((res) => res.json())
      .then((updatedRoom) => {
        setRooms((prev) =>
          prev.map((room) => (room.id === id ? updatedRoom : room))
        );
      });
  }

  return (
    <div>
      <h2>Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            Room {room.number} - Available: {room.available}
            <button onClick={() => updateAvailability(room.id, room.available - 1)}>
              Decrease
            </button>
            <button onClick={() => updateAvailability(room.id, room.available + 1)}>
              Increase
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Rooms;
