import React, {useState, useEffect} from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'

const Reservations = () => {
  const {hotelId} = useParams()
  const [bookings, setBookings] = useState([])

  useEffect(()=>{
    fetch(`/hotels/${hotelId}/bookings`)
    .then((r) => r.json())
    .then((data) => setBookings(data))
  }, [hotelId])


  return (
    <div>
      <h2>Reservations</h2>
      <ul>
        {bookings.map((b) =>(
          <li key={b.id}>
            <p>Guest Name: {b.guest.name}</p>
            <p>Guest Email: {b.guest.email}</p>
            <p>Check-In Date: {b.check_in_date}</p>
            <p>Check-Out Date: {b.check_out_date}</p>

            <ul>
              {b.rooms.map((r) =>(
                <li>
                  <p>Room Name: {r.room_name}</p>
                  <p>Price per Night: {r.price_per_night}</p>
                  <p>Availability: {r.is_available}</p>
                </li>
              ))}
            </ul>

            <span>Status: {b.status}</span>
          </li>
        ))}
      </ul>
      
    </div>
  )
}

export default Reservations