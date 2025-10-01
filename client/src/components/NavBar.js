import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ user, setUser }) => {
  const handleLogout = () => {
    fetch("/logout", { method: "DELETE", credentials: "include" })
      .then(() => setUser(null))
      .catch(() => setUser(null));
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.brand}>Hotel Booking Management App 🏨</h2>
      <div>
        {user ? (
          <>
            <span style={styles.welcome}>
              Welcome, {user.name || user.email} 🎉
            </span>
            {user.role === "guest" && (
              <Link to="/guest/home" style={styles.link}>
                Guest Home
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin/home" style={styles.link}>
                Admin Home
              </Link>
            )}

            <Link to="/hotels" style={styles.link}>View Hotels</Link>
            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/guest/login" style={styles.link}>
              Guest Login
            </Link>
            <Link to="/guest/signup" style={styles.link}>
              Guest Sign Up
            </Link>
            <Link to="/admin/login" style={styles.link}>
              Admin Login
            </Link>
            <Link to="/admin/signup" style={styles.link}>
              Admin Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f5f5f5",
    padding: "10px 20px",
    borderBottom: "1px solid #ddd",
  },
  brand: {
    margin: 0,
  },
  link: {
    marginLeft: "15px",
    textDecoration: "none",
    color: "#008CBA",
    fontWeight: "bold",
  },
  button: {
    marginLeft: "15px",
    backgroundColor: "#f44336",
    border: "none",
    color: "white",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  welcome: {
    marginRight: "15px",
    fontWeight: "500",
  },
};
