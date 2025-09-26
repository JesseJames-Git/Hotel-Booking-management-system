import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import GuestHomePage from "./GuestHomePage";

function App() {
  const [guest, setGuest] = useState({})
  const [bookings, setBookings] = useState([])
  
  useEffect(() =>{
    fetch('/guests/id')
    .then((r) => r.json())
    .then((data) => setGuest(data))
  }, [])

  useEffect(()=>{
    fetch('/bookings/guest/id')
    .then(r => r.json())
    .then(data => setBookings(data))
  })

  return(
    <div>
      <h1>Hotel Booking Management App</h1>
      <GuestHomePage 
        guest = {guest}
        bookings = {bookings}
      />
    </div>
  )
}

export default App;
