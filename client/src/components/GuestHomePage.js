import React, {useState, useEffect} from 'react'
import GuestHeader from './GuestHeader'

const GuestHomePage = ({guest, my_bookings}) => {

  return (
    <div>
      <GuestHeader />

      <h3>Home Page:</h3>
      <p>Name: {guest.name}</p>
      <p>Email: {guest.email}</p>

      <h2>Bookings:</h2>
      <ul>
        {my_bookings.map((booking) => (
          <li key={booking.id} className="p-4 border rounded mb-2">
            <p><strong>Booking status:</strong> {booking.status}</p>
            <p><strong>Check-in:</strong> {new Date(booking.check_in_date).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(booking.check_out_date).toLocaleDateString()}</p>

            <div>
              <strong>Rooms:</strong>
              <ul>
                {booking.rooms.map((r, index) => (
                  <li key={index} className="ml-4">
                    <p><strong>Hotel:</strong> {r.hotel?.name || "N/A"}</p>
                    <p><strong>Room Name:</strong> {r.room_name}</p>
                    <p><strong>Room Type:</strong> {r.room_type?.type_name}</p>
                    <p><strong>Price per Night:</strong> {r.price_per_night}</p>
                    <p><strong>Availability:</strong> {r.is_available ? "Available" : "Not Available"}</p>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}

        <button>Update</button>
        <button>Prev</button>
        <button>Next</button>
        <button>Delete</button>
      </ul>
      



    </div>
  )
}

export default GuestHomePage