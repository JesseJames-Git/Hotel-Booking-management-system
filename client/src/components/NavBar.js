import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styling/NavBar.css";

const NavBar = ({ user, setUser, hotel }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    fetch("/guests/logout", { method: "DELETE", credentials: "include" })
      .then(() => setUser(null))
      .catch(() => setUser(null));
  };

  return (
    <nav className={`navbar-vertical ${isOpen ? "open" : ""}`}>
      <div className="navbar-header">
        <h1 className="brand">Hotel Booking Management</h1>
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {user && (
        <div className="welcome-section">
          <span className="welcome">Welcome, {user.name || user.email} 🎉</span>
        </div>
      )}

      {/* Navigation links */}
      <div className="nav-links-vertical">
        {user ? (
          <>
            <NavLink to="/home" className="link" activeClassName="active-link">
              Home
            </NavLink>

            {user.role === "guest" && (
              <NavLink
                to="/guest/home"
                className="link"
                activeClassName="active-link"
              >
                Bookings
              </NavLink>
            )}

            {user.role === "admin" && (
              <>
                <NavLink
                  to="/admin/home"
                  className="link"
                  activeClassName="active-link"
                >
                  Admin Home
                </NavLink>

                {hotel && (
                  <NavLink
                    to={`/hotel/${hotel.id}/reservations`}
                    className="link"
                    activeClassName="active-link"
                  >
                    Reservations
                  </NavLink>
                )}

                <NavLink
                  to="/hotel/add_room"
                  className="link"
                  activeClassName="active-link"
                >
                  Add Room
                </NavLink>

                <NavLink
                  to="/admin/add_amenities"
                  className="link"
                  activeClassName="active-link"
                >
                  Add Amenities
                </NavLink>

                <NavLink
                  to="/admin/hotel/rooms"
                  className="link"
                  activeClassName="active-link"
                >
                  View Rooms
                </NavLink>
              </>
            )}

            <NavLink
              to="/hotels"
              className="link"
              activeClassName="active-link"
            >
              View Hotels
            </NavLink>

            <button onClick={handleLogout} className="btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/home" className="link" activeClassName="active-link">
              Home
            </NavLink>
            <NavLink
              to="/guest/login"
              className="link"
              activeClassName="active-link"
            >
              Guest Login
            </NavLink>
            <NavLink
              to="/guest/signup"
              className="link"
              activeClassName="active-link"
            >
              Guest Sign Up
            </NavLink>
            <NavLink
              to="/admin/login"
              className="link"
              activeClassName="active-link"
            >
              Admin Login
            </NavLink>
            <NavLink
              to="/admin/signup"
              className="link"
              activeClassName="active-link"
            >
              Admin Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
