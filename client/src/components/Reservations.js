import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import "../styling/Reservations.css";

const Reservations = () => {
  const { hotelId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [editingBookingId, setEditingBookingId] = useState(null);

  useEffect(() => {
    fetch(`/hotels/${hotelId}/bookings`)
      .then((r) => r.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [hotelId]);

  const handleStatusChange = (bookingId, newStatus, resetForm) => {
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
        setEditingBookingId(null);
        resetForm();
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  const statusSchema = yup.object().shape({
    status: yup
      .string()
      .oneOf(["Pending", "Denied", "Confirmed"], "Invalid status")
      .required("Status is required"),
  });

  return (
    <div className="reservations-container">
      <h2 className="reservations-title">Reservations</h2>
      {bookings.length === 0 ? (
        <p className="empty-msg">No reservations found for this hotel.</p>
      ) : (
        <ul className="reservations-list">
          {bookings.map((b) => (
            <li key={b.id} className="reservation-card">
              <div className="reservation-details">
                <h3>Guest: {b.guest ? b.guest.name : "Unknown"}</h3>
                <p><strong>Email:</strong> {b.guest?.email || "N/A"}</p>
                <p><strong>Check-In:</strong> {b.check_in_date}</p>
                <p><strong>Check-Out:</strong> {b.check_out_date}</p>
              </div>

              <div className="room-list">
                <h4>Rooms</h4>
                {b.rooms.map((r) => (
                  <div key={r.id} className="room-item">
                    <p><strong>{r.room_name}</strong></p>
                    <p>Price: ${r.price_per_night}</p>
                    <p>Available: {r.is_available ? "Yes" : "No"}</p>
                  </div>
                ))}
              </div>

              {editingBookingId === b.id ? (
                <FormikStatusForm
                  booking={b}
                  statusSchema={statusSchema}
                  handleStatusChange={handleStatusChange}
                  cancelEdit={() => setEditingBookingId(null)}
                />
              ) : (
                <div className="status-section">
                  <p className={`status-label status-${b.status.toLowerCase()}`}>
                    Status: {b.status}
                  </p>
                  <button
                    className="btn-edit"
                    onClick={() => setEditingBookingId(b.id)}
                  >
                    Change
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FormikStatusForm = ({ booking, statusSchema, handleStatusChange, cancelEdit }) => {
  const formik = useFormik({
    initialValues: { status: booking.status || "Pending" },
    validationSchema: statusSchema,
    onSubmit: (values, { resetForm }) =>
      handleStatusChange(booking.id, values.status, resetForm),
  });

  return (
    <form onSubmit={formik.handleSubmit} className="status-form">
      <select
        name="status"
        value={formik.values.status}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        <option value="Pending">Pending</option>
        <option value="Denied">Denied</option>
        <option value="Confirmed">Confirmed</option>
      </select>
      {formik.errors.status && formik.touched.status && (
        <p className="error-text">{formik.errors.status}</p>
      )}
      <div className="form-buttons">
        <button type="submit" className="btn-save">Save</button>
        <button type="button" className="btn-cancel" onClick={cancelEdit}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Reservations;
