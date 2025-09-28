import React from 'react'

const GuestHeader = ({guest}) => {
  return (
    <div>
      <h2>Welcome {guest.name}</h2>
      <div>
        <button>Home</button>
        <button>View Hotels</button>
      </div>
    </div>
  )
}

export default GuestHeader