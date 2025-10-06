import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import "../styling/AddHotel.css"

const AddHotel = ({ onHotelAdded }) => {
  const schema = yup.object().shape({
    name: yup.string().max(25).required("This field is required"),
    email: yup.string().email("Invalid email").required("This field is required"),
    phone: yup.string().max(17).required("This field is required"),
    city: yup.string().required("This field is required"),
    country: yup.string().required("This field is required"),
    address: yup.string().required("This field is required"),
  })

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useFormik({
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
        body: JSON.stringify(formValues),
      })
        .then((r) => r.json())
        .then((newHotel) => {
          console.log("Hotel added:", newHotel);
          resetForm();
          onHotelAdded?.(newHotel);
        })
    },
  })

  function toTitleCase(str) {
    return str
      .toLowerCase() 
      .split(' ') 
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
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
  )
}
export default AddHotel;
