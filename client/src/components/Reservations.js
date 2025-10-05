import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Reservations = () => {
  const { hotelId } = useParams()
  const [bookings, setBookings] = useState([])
  const [editingBookingId, setEditingBookingId] = useState(null)

  useEffect(() => {
    fetch(`/hotels/${hotelId}/bookings`)
      .then((r) => r.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [hotelId])

  const handleStatusChange = (bookingId, newStatus) => {
    fetch(`/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => r.json())
      .then((updatedBooking) => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? updatedBooking : b))
        );
        setEditingBookingId(null)
      })
      .catch((err) => console.error("Error updating status:", err));
  }

  return (
    <div>
      <h2>Reservations</h2>
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            <p>Guest Name: {b.guest.name}</p>
            <p>Guest Email: {b.guest.email}</p>
            <p>Check-In Date: {b.check_in_date}</p>
            <p>Check-Out Date: {b.check_out_date}</p>

            <ul>
              {b.rooms.map((r) => (
                <li key={r.id}>
                  <p>Room Name: {r.room_name}</p>
                  <p>Price per Night: {r.price_per_night}</p>
                  <p>Availability: {r.is_available}</p>
                </li>
              ))}
            </ul>

            {editingBookingId === b.id ? (
              <div>
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Denied">Denied</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
                <button onClick={()=>setEditingBookingId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <p>Status: {b.status}</p>
                <button onClick={() => setEditingBookingId(b.id)}>Change</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reservations;
