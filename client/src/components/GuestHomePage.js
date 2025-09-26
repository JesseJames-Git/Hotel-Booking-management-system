import React, {useState, useEffect} from 'react'
import GuestHeader from './GuestHeader'

const GuestHomePage = (guest, bookings) => {

  return (
    <div>
      <GuestHeader />

      <h3>Home Page:</h3>
      <p>Name: {guest.id}</p>
      <p>Email: {guest.email}</p>

      <h2>Bookings:</h2>
      <ul>
        {bookings.map((booking) =>{     
            <li key={booking.id}>      
              <p>Hotel: </p>
              <p>Rooms:</p>
              <p>Check_in_date: </p>
              <p>Check_out_date</p>
              <p>Reservation status: </p>
            </li>
        })}
        <button>Update</button>
        <button>Prev</button>
        <button>Next</button>
        <button>Delete</button>
      </ul>
      



    </div>
  )
}

export default GuestHomePage