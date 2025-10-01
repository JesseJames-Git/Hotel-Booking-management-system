import React  from 'react';
import { Link, useHistory } from 'react-router-dom';
import GuestHomePage from './GuestHomePage';
import { useState, useEffect } from 'react';

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
        <div style={{ padding: '10px', textAlign: 'right' }}>
          <button onClick={logout}>Logout</button>
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
    <div >
      <h2>About Us</h2>
      <p>Want a place for vacation, workshop or any other recreation but not know where?. </p>
      <p>Want to make a booking in processes that takes minutes?</p>
      <p>You have your hotel and want smoother booking processes?</p>

      <p>Look no further because this web app covers all these and does much more!!! Just sign up to get started.</p>
    </div>
  );
};

export default StartingPage;