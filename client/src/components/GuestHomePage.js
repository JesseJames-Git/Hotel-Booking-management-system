import React, { useState } from "react"
import "../styling/GuestHomePage.css"

const GuestHomePage = ({ guest, my_bookings, setBookings }) => {
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [dates, setDates] = useState({ check_in_date: "", check_out_date: "" })
  const [saving, setSaving] = useState(false)

  const handleUpdate = (booking) => {
    setEditingBookingId(booking.id)
    const inDate = booking.check_in_date ? booking.check_in_date.split("T")[0] : ""
    const outDate = booking.check_out_date ? booking.check_out_date.split("T")[0] : ""
    setDates({ check_in_date: inDate, check_out_date: outDate })
  }

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value })
  }

  const handleSubmitUpdate = (bookingId) => {
    if (!dates.check_in_date || !dates.check_out_date) {
      alert("Please provide both check-in and check-out dates.")
      return
    }
    const start = new Date(dates.check_in_date)
    const end = new Date(dates.check_out_date)
    if (end <= start) {
      alert("Check-out must be after check-in.")
      return
    }

    setSaving(true)

    const payload = {
      check_in_date: `${dates.check_in_date}T12:00:00`,
      check_out_date: `${dates.check_out_date}T12:00:00`,
    }

    fetch(`/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update booking")
        return res.json()
      })
      .then((updatedBooking) => {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)))
        setEditingBookingId(null)
      })
      .catch((err) => {
        console.error(err)
        alert("Could not update booking. Try again.")
      })
      .finally(() => setSaving(false))
  }

  const handleCancel = (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return

    const previous = [...my_bookings]
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))

    fetch(`/bookings/${bookingId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) {
          setBookings(previous)
          throw new Error("Failed to delete booking")
        }
      })
      .catch((err) => {
        console.error(err)
        alert("Could not cancel booking. Try again.")
        setBookings(previous)
      })
  }

  return (
    <div className="guest-home">
      <div className="guest-profile">
        <h2>👤 Welcome, {guest.name}</h2>
        <p>{guest.email}</p>
      </div>

      <h3>Your Bookings</h3>
      <div className="bookings-list">
        {!my_bookings || my_bookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          my_bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <p className={`status ${booking.status.toLowerCase()}`}>
                Status: {booking.status}
              </p>

              <div className="room-info">
                {booking.rooms.map((r, index) => (
                  <div key={index} className="room-details">
                    <p><strong>Hotel:</strong> {r.hotel?.name || "N/A"}</p>
                    <p><strong>Room:</strong> {r.room_name}</p>
                    <p><strong>Type:</strong> {r.room_type?.type_name}</p>
                    <p><strong>Price/Night:</strong> ${r.price_per_night}</p>
                    <p><strong>Availability:</strong> {r.is_available ? "✅ Available" : "❌ Not Available"}</p>
                  </div>
                ))}
              </div>

              {editingBookingId === booking.id ? (
                <div className="edit-dates">
                  <label>
                    New Check-in:
                    <input
                      type="date"
                      name="check_in_date"
                      value={dates.check_in_date}
                      onChange={handleDateChange}
                    />
                  </label>
                  <label>
                    New Check-out:
                    <input
                      type="date"
                      name="check_out_date"
                      value={dates.check_out_date}
                      onChange={handleDateChange}
                    />
                  </label>
                  <div className="actions">
                    <button className="btn btn-primary" onClick={() => handleSubmitUpdate(booking.id)} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingBookingId(null)} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dates-and-buttons">
                  <p><strong>Check-in:</strong> {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Check-out:</strong> {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : "N/A"}</p>
                  <div className="actions">
                    <button className="btn btn-primary" onClick={() => handleUpdate(booking)}>Update Dates</button>
                    <button className="btn btn-danger" onClick={() => handleCancel(booking.id)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GuestHomePage
