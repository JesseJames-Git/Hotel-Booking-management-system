import React from "react";
import { NavLink } from "react-router-dom";
import "../styling/NavBar.css";

const NavBar = ({ user, setUser }) => {
  const handleLogout = () => {
    fetch("/guests/logout", { method: "DELETE", credentials: "include" })
      .then(() => setUser(null))
      .catch(() => setUser(null));
  };

  return (
    <nav className="navbar">
      <h2 className="brand">Hotel Booking Management App</h2>
      <br />
      <div className="nav-links">
        {user ? (
          <>
            <span className="welcome">
              Welcome, {user.name || user.email} 🎉
            </span>

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
              <NavLink
                to="/admin/home"
                className="link"
                activeClassName="active-link"
              >
                Admin Home
              </NavLink>
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
