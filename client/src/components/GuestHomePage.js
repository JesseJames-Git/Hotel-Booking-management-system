import React, {useState, useEffect} from 'react'
import GuestHeader from './GuestHeader'

const GuestHomePage = () => {
  const [guest, setguest] = useState({})
  
  useEffect(() =>{
    fetch('/guests/id')
    .then((r) => r.json())
    .then((data) => setguest(data))
  })

  return (
    <div>
      <GuestHeader />


    </div>
  )
}

export default GuestHomePage