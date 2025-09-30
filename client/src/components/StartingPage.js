import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import GuestHomePage from './GuestHomePage'; // Your provided component

const useAuth = () => {
  // In a real application, replace this with actual state from Context or Redux.
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentBookings, setCurrentBookings] = React.useState([]);

  // Mock function to simulate a login/logout
  const login = (userData) => {
    setCurrentUser(userData);
    // In a real scenario, you'd fetch their bookings/data here
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentBookings([]);
  };

  // Example: Use a dummy user for testing the GuestHomePage render
  // React.useEffect(() => {
  //   login({ id: 1, name: 'Test Guest', email: 'test@guest.com', role: 'guest' });
  // }, []);

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
  // Access the authentication state
  const { user, isGuest, isAdmin, my_bookings, setBookings, logout } = useAuth();
  const history = useHistory();

  // Redirect Logic for Admin: If an Admin is logged in, send them to their home page
  React.useEffect(() => {
    if (isAdmin) {
      // Replaces the current entry in the history stack
      history.replace('/admin/home'); 
    }
  }, [isAdmin, history]);

  // Handle case where a GUEST is logged in
  if (isGuest) {
    // Show the GuestHomePage component directly if a Guest is logged in.
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
    <div className="Startingpage-container" style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to the Hotel Booking Portal 🏨</h1>
      <p style={{ marginBottom: '40px' }}>Please select your access type to continue.</p>

      <div className="login-options" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
        
        {/* Guest Login Option */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '60%', marginLeft: '-30px' }}>
          <h2>Guest Access 👥</h2>
          <p>Sign in to view and manage your reservations.</p>
          <Link to="/guest/login">
            <button style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              margin: '5px'
            }}>
              Guest Login
            </button>
          </Link>
          <Link to="/guest/signup">
            <button style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              backgroundColor: '#008CBA', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              margin: '5px'
            }}>
              Guest Sign-up
            </button>
          </Link>
        </div>
        
        {/* Admin Login Option */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '60%', marginLeft: '80px' }}>
          <h2>Admin Access 🔑</h2>
          <p>Hotel staff login to manage rooms and operations.</p>
          <Link to="/admin/login">
            <button style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              backgroundColor: '#f44336fd', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              margin: '5px'
            }}>
              Admin Login
            </button>
          </Link>
          <Link to="/admin/signup">
            <button style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              backgroundColor: '#a56102ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              margin: '5px'
            }}>
              Admin Sign-up
            </button>
          </Link>
        </div>
      </div>

      <p style={{ marginTop: '40px', fontSize: '12px', color: '#666' }}>
      </p>
    </div>
  );
};

export default StartingPage;