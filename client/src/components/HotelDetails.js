import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const HotelDetails = ({ match }) => {
  const { id } = match.params
  const [hotel, setHotel] = useState(null)

  useEffect(() => {
    fetch(`/hotels/${id}`)
      .then((r) => r.json())
      .then((d) => setHotel(d))
  }, [id])

  if (!hotel) return <p>Loading...</p>

  return (
    <div>
      <h1>{hotel.name}</h1>
      <p>{hotel.city}, {hotel.country}</p>
      <p>{hotel.address}</p>
      <p>{hotel.phone}</p>

      <h3>Amenities</h3>
      <ul>
        {hotel.hotel_amenities?.map((a) => (
          <li key={a.id}>{a.name}: {a.description}</li>
        ))}
      </ul>

      <h3>Rooms</h3>
      <ul>
        {hotel.rooms?.map((r) => (
          <li key={r.id}>
            {r.room_name} — {r.room_type?.type_name} (${r.price_per_night})
          </li>
        ))}
      </ul>

      <Link to="/hotels">
        <button>⬅ Back to Hotels</button>
      </Link>
      <Link to={`/hotels/${id}/book`}>
        <button> Book Now </button>
      </Link>
    </div>
  )
}

export default HotelDetails
