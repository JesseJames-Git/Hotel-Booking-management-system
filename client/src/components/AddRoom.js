import React, { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"

const AddForm = ({ hotel }) => {
  const [roomTypes, setRoomTypes] = useState([])

  useEffect(() => {
    fetch("/room_types")
      .then((r) => r.json())
      .then((data) => setRoomTypes(data))
      .catch((err) => console.error("Error fetching room types:", err))
  }, [])

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
      const payload = { ...values, hotel_id: hotel.id }

      fetch("/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to add room")
          return r.json()
        })
        .then((data) => {
          alert(`Room "${data.room_name}" added successfully!`)
          resetForm()
        })
        .catch((err) => console.error("Error adding room:", err))
    },
  })

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add a Room</h2>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

        {/* Room Name */}
        <div>
          <label className="block font-medium">Room Name</label>
          <input
            type="text"
            name="room_name"
            value={formik.values.room_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border p-2 rounded w-full"
            placeholder="e.g. Deluxe Suite"
          />
          {formik.touched.room_name && formik.errors.room_name && (
            <div className="text-red-500 text-sm">{formik.errors.room_name}</div>
          )}
        </div>

        {/* Price per night */}
        <div>
          <label className="block font-medium">Price per Night ($)</label>
          <input
            type="text"
            name="price_per_night"
            value={formik.values.price_per_night}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border p-2 rounded w-full"
            placeholder="e.g. 120.00"
          />
          {formik.touched.price_per_night && formik.errors.price_per_night && (
            <div className="text-red-500 text-sm">{formik.errors.price_per_night}</div>
          )}
        </div>

        {/* Room Type */}
        <div>
          <label className="block font-medium">Room Type</label>
          <select
            name="room_type_id"
            value={formik.values.room_type_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border p-2 rounded w-full"
          >
            <option value="">Select a type...</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.type_name} — {rt.description}
              </option>
            ))}
          </select>
          {formik.touched.room_type_id && formik.errors.room_type_id && (
            <div className="text-red-500 text-sm">{formik.errors.room_type_id}</div>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_available"
            checked={formik.values.is_available}
            onChange={formik.handleChange}
          />
          <label>Available</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Room
        </button>
      </form>
    </div>
  )
}

export default AddForm
