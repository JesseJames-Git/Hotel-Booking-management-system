import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import GuestHomePage from './GuestHomePage';
import { motion } from "framer-motion";
import '../styling/StartingPage.css'

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentBookings, setCurrentBookings] = useState([]);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentBookings([]);
  };

  return {
    user: currentUser,
    isGuest: currentUser?.role === 'guest',
    isAdmin: currentUser?.role === 'admin',
    my_bookings: currentBookings,
    setBookings: setCurrentBookings,
    login,
    logout
  };
};
// =================================================================

const StartingPage = () => {
  const { user, isGuest, isAdmin, my_bookings, setBookings, logout } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (isAdmin) {
      history.replace('/admin/home'); 
    }
  }, [isAdmin, history]);

  if (isGuest) {
    return (
      <div className="guest-portal-wrapper">
        <div className="logout-wrapper">
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
        <GuestHomePage
          guest={user}
          my_bookings={my_bookings}
          setBookings={setBookings}
        />
      </div>
    );
  }

  return (
    <div className="starting-container">
      {/* Hero Section */}
      <motion.h1 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="hero-title"
      >
        Find the Perfect Stay in Minutes
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="hero-subtext"
      >
        Whether you're planning a <span className="highlight">vacation</span>, hosting a <span className="highlight">workshop</span>, 
        or just need a quick getaway, our platform makes booking <span className="highlight-primary">easy, fast, and reliable</span>.
      </motion.p>

      {/* Features Section */}
      <div className="features-grid">
        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <h3>✨ Easy Booking</h3>
          <p>Book your stay in just a few clicks — no stress, no delays.</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <h3>🏨 Hotel Management</h3>
          <p>Hotel owners get powerful tools to manage bookings with ease.</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <h3>🌍 Perfect for Everyone</h3>
          <p>From vacations to workshops, we’ve got you covered.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StartingPage;
