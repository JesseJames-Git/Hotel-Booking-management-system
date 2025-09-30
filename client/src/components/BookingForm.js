import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const BookingSchema = Yup.object().shape({
  check_in_date: Yup.date()
    .required("Check-in date is required")
    .min(new Date(), "Check-in cannot be in the past"),
  check_out_date: Yup.date()
    .required("Check-out date is required")
    .min(Yup.ref("check_in_date"), "Check-out must be after check-in"),
  guests: Yup.number().required().min(1, "At least 1 guest"),
  booked_rooms: Yup.array().of(
    Yup.object().shape({
      room_id: Yup.number().required(),
      quantity: Yup.number().min(0),
      selected: Yup.boolean(),
    })
  ),
})

const BookingForm = ({ guestId, onBookingSuccess }) => {
  const { hotelId } = useParams()
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    if (hotelId) {
      fetch(`/hotels/${hotelId}/rooms`)
        .then((r) => r.json())
        .then((data) => {
          console.log("Fetched rooms:", data) // 👈 debug
          setRooms(data)
        })
        .catch((err) => console.error("Failed to load rooms:", err))
    }
  }, [hotelId])

  return (
    <div>
      <h2>Make a Booking</h2>

      <Formik
        initialValues={{
          check_in_date: "",
          check_out_date: "",
          guests: 1,
          booked_rooms: rooms.map((room) => ({
            room_id: room.id,
            quantity: 0,
            selected: false,
          })),
        }}
        enableReinitialize
        validationSchema={BookingSchema}
        onSubmit={(values, { setSubmitting, setStatus, resetForm }) => {
          setStatus(null)

          // Only include selected rooms
          const selectedRooms = values.booked_rooms.filter((br) => br.selected)

          if (selectedRooms.length === 0) {
            setStatus("Please select at least one room.")
            setSubmitting(false)
            return
          }

          fetch("/my_bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guest_id: guestId,
              hotel_id: hotelId,
              check_in_date: values.check_in_date,
              check_out_date: values.check_out_date,
              guests: values.guests,
              booked_rooms: selectedRooms,
            }),
          })
            .then((r) => {
              if (!r.ok) throw new Error("Failed to create booking")
              return r.json()
            })
            .then((newBooking) => {
              if (onBookingSuccess) {
                onBookingSuccess(newBooking)
              }
              resetForm()
            })
            .catch((err) => {
              setStatus(err.message)
            })
            .finally(() => {
              setSubmitting(false)
            })
        }}
      >
        {({ values, setFieldValue, isSubmitting, status }) => (
          <Form>
            {/* Dates & Guests */}
            <div>
              <label>Check-in Date:</label>
              <Field type="date" name="check_in_date" />
              <ErrorMessage
                name="check_in_date"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            <div>
              <label>Check-out Date:</label>
              <Field type="date" name="check_out_date" />
              <ErrorMessage
                name="check_out_date"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            <div>
              <label>Total Guests:</label>
              <Field type="number" name="guests" min="1" />
              <ErrorMessage
                name="guests"
                component="div"
                style={{ color: "red" }}
              />
            </div>

            {/* Rooms */}
            <h3>Select Rooms</h3>
            {rooms.length === 0 ? (
              <p>No rooms available for this hotel.</p>
            ) : (
              rooms.map((room, index) => {
                const isSelected = values.booked_rooms[index]?.selected
                return (
                  <div
                    key={room.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "15px",
                      background: isSelected ? "#d1f7c4" : "#f9f9f9",
                    }}
                  >
                    <h4>{room.name || room.room_name}</h4>
                    <p>${room.price_per_night} / night</p>

                    <label>Quantity: </label>
                    <Field
                      type="number"
                      name={`booked_rooms[${index}].quantity`}
                      min="0"
                      disabled={!isSelected}
                    />
                    <Field
                      type="hidden"
                      name={`booked_rooms[${index}].room_id`}
                      value={room.id}
                    />

                    <button
                      type="button"
                      style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        background: isSelected ? "green" : "blue",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setFieldValue(
                          `booked_rooms[${index}].selected`,
                          !isSelected
                        )
                      }
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                )
              })
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>

            {status && <p style={{ color: "red" }}>{status}</p>}
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default BookingForm
