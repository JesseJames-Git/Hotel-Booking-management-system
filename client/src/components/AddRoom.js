import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../styling/AddRoom.css";

const AddRoom = ({ hotel }) => {
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    fetch("/room_types")
      .then((r) => r.json())
      .then((data) => setRoomTypes(data))
      .catch((err) => console.error("Error fetching room types:", err));
  }, []);

  const formik = useFormik({
    initialValues: {
      room_name: "",
      price_per_night: "",
      room_type_id: "",
      is_available: true,
    },
    validationSchema: Yup.object({
      room_name: Yup.string().required("Room name is required"),
      price_per_night: Yup.number()
        .typeError("Price must be a number")
        .positive("Price must be positive")
        .required("Price is required"),
      room_type_id: Yup.string().required("Room type is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = { ...values, hotel_id: hotel.id };

      fetch("/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to add room");
          return r.json();
        })
        .then((data) => {
          alert(`Room "${data.room_name}" added successfully!`);
          resetForm();
        })
        .catch((err) => console.error("Error adding room:", err));
    },
  });

  return (
    <div className="add-room-container">
      <h2 className="add-room-title">Add a Room</h2>

      <form onSubmit={formik.handleSubmit} className="add-room-form">
        {/* Room Name */}
        <div className="form-group">
          <label htmlFor="room_name">Room Name</label>
          <input
            type="text"
            name="room_name"
            id="room_name"
            value={formik.values.room_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Deluxe Suite"
            className={formik.errors.room_name && formik.touched.room_name ? "input-error" : ""}
          />
          {formik.touched.room_name && formik.errors.room_name && (
            <p className="error-msg">{formik.errors.room_name}</p>
          )}
        </div>

        {/* Price per night */}
        <div className="form-group">
          <label htmlFor="price_per_night">Price per Night ($)</label>
          <input
            type="text"
            name="price_per_night"
            id="price_per_night"
            value={formik.values.price_per_night}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. 120.00"
            className={formik.errors.price_per_night && formik.touched.price_per_night ? "input-error" : ""}
          />
          {formik.touched.price_per_night && formik.errors.price_per_night && (
            <p className="error-msg">{formik.errors.price_per_night}</p>
          )}
        </div>

        {/* Room Type */}
        <div className="form-group">
          <label htmlFor="room_type_id">Room Type</label>
          <select
            name="room_type_id"
            id="room_type_id"
            value={formik.values.room_type_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={formik.errors.room_type_id && formik.touched.room_type_id ? "input-error" : ""}
          >
            <option value="">Select a type...</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.type_name} — {rt.description}
              </option>
            ))}
          </select>
          {formik.touched.room_type_id && formik.errors.room_type_id && (
            <p className="error-msg">{formik.errors.room_type_id}</p>
          )}
        </div>

        {/* Availability */}
        <div className="checkbox-group">
          <input
            type="checkbox"
            name="is_available"
            id="is_available"
            checked={formik.values.is_available}
            onChange={formik.handleChange}
          />
          <label htmlFor="is_available">Available</label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Add Room
        </button>
      </form>
    </div>
  );
};

export default AddRoom;
