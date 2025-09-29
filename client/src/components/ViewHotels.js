import React, {useState, useEffect}from 'react'
import GuestHeader from './GuestHeader'

const ViewHotels = () => {

  const [hotels, setHotels] = useState([])

  useEffect(()=>{
    fetch("/hotels")
    .then((r) => (r.json()))
    .then((d) => setHotels(d))
  },[])


  return (
    <div>
      <GuestHeader />
      <h1>Hotels!!!</h1>
      <p>Here is a list of all Hotels!!!</p>
      <ul>
        {hotels.map((h) =>(
          <li onClick={hotelSelection} key={h.id} className='hotelList'>
            <p>Name: {h.name}</p>
            <p>City: {h.city}</p>
            <p>Country: {h.country}</p>
            <p>Address: {h.address}</p>
            <p>Email: {h.email}</p>
            <p>Phone Number: {h.phone}</p>

            <button onClick={viewFullDetails}>View Full Details</button>
            <button onClick={bookingForm}>Booking Now</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ViewHotels