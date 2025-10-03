import React, { useEffect, useState } from "react";

function Reservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/reservations?hotel_id=1")
      .then((res) => res.json())
      .then(setReservations);
  }, []);

  function updateStatus(id, status) {
    fetch(`http://127.0.0.1:5000/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
      });
  }

  return (
    <div>
      <h2>Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.guest_name}</td>
              <td>{r.room_number}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => updateStatus(r.id, "confirmed")}>
                  Confirm
                </button>
                <button onClick={() => updateStatus(r.id, "cancelled")}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reservations;
