import React, { useState } from "react"

const GuestHomePage = ({ guest, my_bookings, setBookings }) => {
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [dates, setDates] = useState({ check_in_date: "", check_out_date: "" })
  const [saving, setSaving] = useState(false)

  const handleUpdate = (booking) => {
    setEditingBookingId(booking.id)
    const inDate = booking.check_in_date ? booking.check_in_date.split(" ")[0] : ""
    const outDate = booking.check_out_date ? booking.check_out_date.split(" ")[0] : ""
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
      .then((updatedBookingList) => setBookings(updatedBookingList))
      .catch((err) => {
        console.error(err)
        alert("Could not cancel booking. Try again.")
      })
  }

  return (
    <div>
      <h3>Home Page:</h3>
      <p>Name: {guest.name}</p>
      <p>Email: {guest.email}</p>

      <h3>Bookings:</h3>
      <ul>
        {my_bookings.length === 0 ? (
          <li>No bookings found.</li>
        ) : (
          my_bookings.map((booking) => (
            <li key={booking.id}>
              <p>
                <strong>Booking status:</strong> {booking.status}
              </p>

              <div>
                <strong>Rooms:</strong>
                <ul>
                  {booking.rooms.map((r, index) => (
                    <li key={index}>
                      <p>
                        <strong>Hotel:</strong> {r.hotel?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Room Name:</strong> {r.room_name}
                      </p>
                      <p>
                        <strong>Room Type:</strong> {r.room_type?.type_name}
                      </p>
                      <p>
                        <strong>Price per Night:</strong> {r.price_per_night}
                      </p>
                      <p>
                        <strong>Availability:</strong>{" "}
                        {r.is_available ? "Available" : "Not Available"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {editingBookingId === booking.id ? (
                <div style={{ marginTop: 8 }}>
                  <label>
                    New Check-in:
                    <input
                      type="date"
                      name="check_in_date"
                      value={dates.check_in_date}
                      onChange={handleDateChange}
                    />
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    New Check-out:
                    <input
                      type="date"
                      name="check_out_date"
                      value={dates.check_out_date}
                      onChange={handleDateChange}
                    />
                  </label>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => handleSubmitUpdate(booking.id)} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingBookingId(null)
                      }}
                      style={{ marginLeft: 8 }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Check-in:</strong>{" "}
                    {booking.check_in_date
                      ? new Date(booking.check_in_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Check-out:</strong>{" "}
                    {booking.check_out_date
                      ? new Date(booking.check_out_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <button onClick={() => handleUpdate(booking)}>Update Check-in/ Check-out Dates</button>
                  <button onClick={() => handleCancel(booking.id)} style={{ marginLeft: 8 }}>
                    Cancel Reservation
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default GuestHomePage
