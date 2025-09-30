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
        .then((data) => setRooms(data))
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
          })),
        }}
        enableReinitialize
        validationSchema={BookingSchema}
        onSubmit={(values, { setSubmitting, setStatus, resetForm }) => {
          setStatus(null)

          fetch("/my_bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guest_id: guestId,
              hotel_id: hotelId,
              check_in_date: values.check_in_date,
              check_out_date: values.check_out_date,
              guests: values.guests,
            }),
          })
            .then((r) => {
              if (!r.ok) throw new Error("Failed to create booking")
              return r.json()
            })
            .then(async (newBooking) => {
              const bookedRoomsPromises = values.booked_rooms
                .filter((br) => br.quantity > 0)
                .map((br) =>
                  fetch("/booked_rooms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      booking_id: newBooking.id,
                      room_id: br.room_id,
                      quantity: br.quantity,
                    }),
                  }).then((r) => {
                    if (!r.ok) throw new Error("Failed to create booked room")
                    return r.json()
                  })
                )

              const bookedRooms = await Promise.all(bookedRoomsPromises)

              if (onBookingSuccess) {
                onBookingSuccess({ ...newBooking, booked_rooms: bookedRooms })
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
        {({ isSubmitting, status }) => (
          <Form>
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

            <h3>Select Rooms</h3>
            {rooms.map((room, index) => (
              <div key={room.id} style={{ marginBottom: "10px" }}>
                <p>
                  {room.name} – ${room.price_per_night} / night
                </p>
                <label>Quantity:</label>
                <Field
                  type="number"
                  name={`booked_rooms[${index}].quantity`}
                  min="0"
                />
                <Field
                  type="hidden"
                  name={`booked_rooms[${index}].room_id`}
                  value={room.id}
                />
              </div>
            ))}

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
