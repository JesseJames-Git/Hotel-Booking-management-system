import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useHistory } from "react-router-dom";
import Hotel from "./Hotel";
import "../styling/AddHotel.css";

const AddHotel = ({ user }) => {
  const [existingHotel, setExistingHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newHotel, setNewHotel] = useState(null);
  const history = useHistory();

  useEffect(() => {
    fetch(`/admin/hotel`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No hotel found");
      })
      .then((data) => {
        setExistingHotel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Yup schema
  const schema = yup.object().shape({
    name: yup.string().max(25).required("This field is required"),
    email: yup.string().email("Invalid email").required("This field is required"),
    phone: yup.string().max(17).required("This field is required"),
    city: yup.string().required("This field is required"),
    country: yup.string().required("This field is required"),
    address: yup.string().required("This field is required"),
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } =
    useFormik({
      initialValues: {
        name: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        address: "",
      },
      validationSchema: schema,
      onSubmit: (formValues) => {
        fetch("/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...formValues,
            admin_id: user?.id,
          }),
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to create hotel");
            return r.json();
          })
          .then((data) => {
            setNewHotel(data);
            resetForm();
          })
          .catch((err) => console.error("Error creating hotel:", err));
      },
    });

  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (loading) return <p>Loading...</p>;

  if (existingHotel && !newHotel) {
    return (
      <div className="hotel-view-container">
        <div className="hotel-header">
          <h2>Your Hotel: {existingHotel.name}</h2>
          <button
            onClick={() => history.push("/admin/add_amenities")}
            className="add-amenity-btn"
          >
            ➕ Add Amenity
          </button>
        </div>
        <Hotel hotel={existingHotel} />
      </div>
    );
  }

  if (newHotel) {
    return (
      <div className="hotel-view-container">
        <div className="hotel-header">
          <h2>Your Hotel: {newHotel.name}</h2>
          <button
            onClick={() => history.push("/admin/add_amenities")}
            className="add-amenity-btn"
          >
            ➕ Add Amenity
          </button>
        </div>
        <Hotel hotel={newHotel} />
      </div>
    );
  }

  return (
    <div className="add-hotel-container">
      <h2>Add Your Hotel</h2>
      <form onSubmit={handleSubmit}>
        {["name", "email", "phone", "city", "country", "address"].map((field) => (
          <div key={field}>
            <label htmlFor={field}>{toTitleCase(field)}:</label>
            <input
              id={field}
              name={field}
              value={values[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`Enter ${toTitleCase(field)}`}
              className={errors[field] && touched[field] ? "input-errors" : ""}
            />
            {errors[field] && touched[field] && (
              <p className="error-msg">{errors[field]}</p>
            )}
          </div>
        ))}
        <button type="submit">Add Hotel</button>
      </form>
    </div>
  );
};

export default AddHotel;
