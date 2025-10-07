import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import "../styling/AddAmenities.css";

const AddAmenities = ({ hotel }) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const basicSchema = yup.object().shape({
    name: yup
      .string()
      .max(25, "Amenity name must be less than 25 characters")
      .required("Input is required"),
    description: yup
      .string()
      .max(200, "Description must be less than 200 characters")
      .required("Input is required"),
  });

  const { values, errors, touched, handleChange, handleSubmit, handleBlur, resetForm } = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: basicSchema,
    onSubmit: (formValues) => {
      setServerError("");
      setSuccessMessage("");
      fetch(`/api/hotel/${hotel.id}/amenities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Failed to add amenity");
          setSuccessMessage(data.message || "Amenity added successfully!");
          resetForm();
        })
        .catch((err) => {
          setServerError(err.message || "Something went wrong");
          console.error("Failed to add amenity:", err);
        });
    },
  });

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="amenities-form-container">
      <h2 className="amenities-title">Add Amenities</h2>
      <form onSubmit={handleSubmit} className="amenities-form">
        {["name", "description"].map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{toTitleCase(field)}</label>
            <input
              id={field}
              name={field}
              type="text"
              value={values[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`Enter ${toTitleCase(field)}`}
              className={errors[field] && touched[field] ? "input-error" : ""}
            />
            {errors[field] && touched[field] && (
              <p className="error-msg">{errors[field]}</p>
            )}
          </div>
        ))}

        {serverError && <p className="error-msg">{serverError}</p>}
        {successMessage && <p className="success-msg">{successMessage}</p>}

        <button type="submit" className="btn-submit">Add Amenity</button>
      </form>
    </div>
  );
};

export default AddAmenities;
