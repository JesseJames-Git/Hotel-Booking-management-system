import React from 'react'
import { Link } from 'react-router-dom'

const GuestHeader = ({guest}) => {

  return (
    <div>
      <h2>Welcome {guest.name}</h2>
      <div>
        <button>Sign out</button>
        <Link to="/hotels"><button>View Hotels</button></Link>
      </div>
    </div>
  )
}

export default GuestHeader