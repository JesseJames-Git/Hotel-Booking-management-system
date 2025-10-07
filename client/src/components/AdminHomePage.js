// AdminHomePage.js
import React from "react";
import Hotel from "./Hotel";

const AdminHomePage = ({ user, hotel }) => {
  return (
    <div>
      <h2>Welcome {user?.name || "Admin"}</h2>
      {hotel ? (
        <Hotel hotel={hotel} />
      ) : (
        <p>You haven’t added a hotel yet. Please go to the <a href="/admin/add_hotel">Add Hotel</a> page.</p>
      )}
    </div>
  );
};

export default AdminHomePage;
