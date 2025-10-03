import React, { useState } from "react";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    amenities: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:5000/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((newHotel) => {
        setHotels([...hotels, newHotel]);
        setForm({ name: "", location: "", amenities: "" });
      });
  }

  return (
    <div>
      <h2>Add Hotel</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Hotel Name"
          required
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          required
        />
        <input
          name="amenities"
          value={form.amenities}
          onChange={handleChange}
          placeholder="Amenities (comma separated)"
        />
        <button type="submit">Add Hotel</button>
      </form>

      <h3>Existing Hotels</h3>
      <ul>
        {hotels.map((h) => (
          <li key={h.id}>
            {h.name} - {h.location} ({h.amenities})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hotels;
