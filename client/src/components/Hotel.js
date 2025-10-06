import React, { useEffect, useState } from "react";

const Hotel = ({ hotel }) => {

  const [amenities, setAmenities] = useState([])
  useEffect(()=>{
    fetch(`/hotel/${hotel.id}/amenities`)
    .then((r)=> r.json())
    .then((d)=>setAmenities(d))
  },[])

  if (!hotel || hotel.message) return <p>No hotel found for this admin.</p>;

  return (
    <div>
      <div>
        <h2>{hotel.name}</h2>
        <p><strong>Email:</strong> {hotel.email}</p>
        <p><strong>Phone:</strong> {hotel.phone}</p>
        <p><strong>City:</strong> {hotel.city}</p>
        <p><strong>Country:</strong> {hotel.country}</p>
        <p><strong>Address:</strong> {hotel.address}</p>
      </div>
        <h3>Amenities Offered:</h3>
        <ul>
          {amenities.map((a)=>(
            <li key={a.id}>
              <p><strong>Name: </strong>{a.name}</p>
              <p><strong>Description: </strong>{a.description}</p>
            </li>
          ))}
        </ul>
      <div>

      </div>
    </div>
  );
};

export default Hotel;
