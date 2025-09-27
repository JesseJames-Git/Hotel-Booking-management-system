import React, { useEffect, useState } from "react";
import GuestHomePage from "./GuestHomePage";

function App() {
  const [guest, setGuest] = useState({})
  const [my_bookings, setBookings] = useState([])
  
  useEffect(() =>{
    fetch('/guest')
    .then((r) => r.json())
    .then((data) => setGuest(data))
  }, [])

  useEffect(()=>{
    fetch('/my_bookings')
    .then(r => r.json())
    .then(data =>{
      console.log("Fetched bookings:", data)
       setBookings(data)
      })
  },[])

 
  return(
    <div>
      <h1>Hotel Booking Management App</h1>
      <GuestHomePage 
        guest = {guest}
        my_bookings = {my_bookings}
      />
    </div>
  )
}

export default App;
