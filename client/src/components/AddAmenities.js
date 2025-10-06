import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

const AddAmenities = ({ hotel }) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // yup validation
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

  // Formik Form
  const { values, errors, touched, handleChange, handleSubmit, handleBlur, resetForm } = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: basicSchema,

    onSubmit: (formValues) => {
      setServerError("");
      setSuccessMessage("");

      fetch(`/hotel/${hotel.id}/amenities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) {
            throw new Error(data.error || "Failed to add amenity");
          }
          setSuccessMessage(data.message || "Amenity added successfully!");
          resetForm();
        })
        .catch((err) => {
          setServerError(err.message || "Something went wrong");
          console.error("Failed to add amenity:", err);
        });
    },
  });

  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div>
      <h2>Add Amenities</h2>

      <form onSubmit={handleSubmit}>
        {["name", "description"].map((field) => (
          <div key={field}>
            <label htmlFor={field}>{toTitleCase(field)}</label>
            <br />
            <input
              id={field}
              className={errors[field] && touched[field] ? "input-error" : ""}
              name={field}
              type="text"
              value={values[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`Enter ${toTitleCase(field)}`}
            />
            {errors[field] && touched[field] && (
              <p className="error-msg">{errors[field]}</p>
            )}
            <br />
          </div>
        ))}

        {serverError && <p className="error-msg">{serverError}</p>}
        {successMessage && <p className="success-msg">{successMessage}</p>}

        <button type="submit">Add Amenity</button>
      </form>
    </div>
  );
};

export default AddAmenities;
