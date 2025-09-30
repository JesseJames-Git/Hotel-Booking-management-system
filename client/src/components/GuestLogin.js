import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

const GuestLogin = ({ onGuestLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    // 1. Send credentials to the backend
    fetch("/guests/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json().then((guestUser) => {
            if (onGuestLogin) {
              onGuestLogin({ ...guestUser, role: 'guest' }); 
            }
            history.push("/"); 
          });
        } else {
          res.json().then((err) => setErrors([err.message || 'Login failed. Please check your credentials.']));
        }
      })
      .catch(() => {
        setIsLoading(false);
        setErrors(['Network error or server unreachable.']);
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Guest Sign In</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label htmlFor="guest-email" style={styles.label}>Email</label>
        <input
          type="email"
          id="guest-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label htmlFor="guest-password" style={styles.label}>Password</label>
        <input
          type="password"
          id="guest-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Logging in...' : 'Sign In'}
        </button>

        {errors.length > 0 && (
          <div style={styles.errorContainer}>
            {errors.map((err, index) => (
              <p key={index} style={styles.errorMessage}>{err}</p>
            ))}
          </div>
        )}
      </form>
      <p style={styles.footer}>
        Don't have an account? <Link to="/guest/signup">Register here</Link>
      </p>
      <p style={styles.footer}>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
};

export default GuestLogin;

// Basic inline styles
const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#4CAF50',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    errorContainer: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fdd',
        border: '1px solid #f00',
        borderRadius: '4px',
    },
    errorMessage: {
        margin: '0',
        color: 'red',
        fontSize: '14px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
    }
};