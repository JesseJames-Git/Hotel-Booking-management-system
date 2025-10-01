import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ViewHotels = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch("/hotels")
      .then((r) => r.json())
      .then((d) => setHotels(d));
  }, []);

  return (
    <div>
      <h1>Hotels!!!</h1>
      <p>Here is a list of all Hotels!!!</p>

      <ul>
        {hotels.map((h) => (
          <li key={h.id} className="hotelList">
            <p>Name: {h.name}</p>
            <p>City: {h.city}</p>
            <p>Country: {h.country}</p>
            <p>Address: {h.address}</p>
            <p>Email: {h.email}</p>
            <p>Phone Number: {h.phone}</p>

            <Link to={`/hotels/${h.id}`}>
              <button>View Full Details</button>
            </Link>

            <Link to={'/book'}>
            <button>Book Now</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewHotels;
