import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

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

  // yup schema for status form
  const statusSchema = yup.object().shape({
    status: yup
      .string()
      .oneOf(["Pending", "Denied", "Confirmed"], "Invalid status")
      .required("Status is required"),
  });

  return (
    <div>
      <h2>Reservations</h2>
      <ul>
        {bookings.map((b) => (
          <li key={b.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
            <p>Guest Name: {b.guest ? b.guest.name : "Unknown Guest"}</p>
            <p>Guest Email: {b.guest ? b.guest.email : "N/A"}</p>
            <p>Check-In Date: {b.check_in_date}</p>
            <p>Check-Out Date: {b.check_out_date}</p>

            <ul>
              {b.rooms.map((r) => (
                <li key={r.id}>
                  <p>Room Name: {r.room_name}</p>
                  <p>Price per Night: {r.price_per_night}</p>
                  <p>Availability: {r.is_available ? "Yes" : "No"}</p>
                </li>
              ))}
            </ul>

            {editingBookingId === b.id ? (
              <FormikStatusForm
                booking={b}
                statusSchema={statusSchema}
                handleStatusChange={handleStatusChange}
                cancelEdit={() => setEditingBookingId(null)}
              />
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

const FormikStatusForm = ({ booking, statusSchema, handleStatusChange, cancelEdit }) => {
  const formik = useFormik({
    initialValues: { status: booking.status || "Pending" },
    validationSchema: statusSchema,
    onSubmit: (values, { resetForm }) =>
      handleStatusChange(booking.id, values.status, resetForm),
  });

  return (
    <form onSubmit={formik.handleSubmit}>
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
        <p style={{ color: "red" }}>{formik.errors.status}</p>
      )}
      <button type="submit">Save</button>
      <button type="button" onClick={cancelEdit}>
        Cancel
      </button>
    </form>
  );
};

export default Reservations;
