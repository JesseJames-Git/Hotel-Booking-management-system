import React, { useEffect, useState } from "react";

const Hotel = () => {
  const [hotel, setHotel] = useState(null);
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/my_hotel")
      .then((r) => r.json())
      .then((data) => {
        setHotel(data);
        setLoading(false);
      });
  }, []);


  if (loading) return <p>Loading...</p>;
  if (!hotel || hotel.message) return <p>No hotel found for this admin.</p>;

  return (
    <div>
      <h2>{hotel.name}</h2>
      <p><strong>Email:</strong> {hotel.email}</p>
      <p><strong>Phone:</strong> {hotel.phone}</p>
      <p><strong>City:</strong> {hotel.city}</p>
      <p><strong>Country:</strong> {hotel.country}</p>
      <p><strong>Address:</strong> {hotel.address}</p>
    </div>
  );
};

export default Hotel;
