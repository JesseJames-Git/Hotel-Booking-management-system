import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup'; 

// --- Mock Data for Room Selection ---
// In a real application, you would fetch this from your backend (e.g., GET /rooms/available)
const mockAvailableRooms = [
  { id: 101, room_name: 'Room 101', room_type: 'Standard', price: 150.00 },
  { id: 205, room_name: 'Room 205', room_type: 'Deluxe', price: 250.00 },
  { id: 310, room_name: 'Room 310', room_type: 'Suite', price: 400.00 },
];

// --- Yup Validation Schema ---
const BookingSchema = yup.object().shape({
  room_id: yup.string().required('A room must be selected.'),
  check_in_date: yup.date()
    .required('Check-in date is required.')
    .min(new Date(), 'Check-in cannot be in the past.'),
  check_out_date: yup.date()
    .required('Check-out date is required.')
    .min(yup.ref('check_in_date'), 'Check-out date must be after Check-in date.'),
});


// Note: This component assumes the current user's ID is passed via props/context.
// We are using 'currentUser.id' in the submission logic.
const MakeBooking = ({ currentUser, onBookingSuccess }) => {
  const [submissionError, setSubmissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // In a real app, replace mockAvailableRooms with a state variable populated via useEffect
  const availableRooms = mockAvailableRooms; 

  const initialValues = {
    room_id: '',
    check_in_date: '',
    check_out_date: '',
  };

  const handleSubmit = (values) => {
    setIsLoading(true);
    setSubmissionError(null);

    if (!currentUser || !currentUser.id) {
        setSubmissionError("Authentication error: Guest ID is missing.");
        setIsLoading(false);
        return;
    }

    // Prepare payload for backend (Dates must be UTC ISO strings for backend parsing)
    const payload = {
      guest_id: currentUser.id,
      room_id: parseInt(values.room_id, 10), // Convert room_id back to integer
      check_in_date: new Date(values.check_in_date).toISOString(),
      check_out_date: new Date(values.check_out_date).toISOString(),
    };

    // Assuming backend endpoint for creating a Booking is POST /bookings
    fetch("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json().then((newBooking) => {
            // Success: Notify parent component and redirect
            if (onBookingSuccess) {
                onBookingSuccess(newBooking);
            }
            // Navigate to guest dashboard or booking confirmation page
            navigate("/guest/dashboard"); 
          });
        } else {
          // Handle server-side errors (e.g., room is unavailable for selected dates)
          res.json().then((err) => {
            setSubmissionError(err.message || 'Booking failed. Check room availability and dates.');
          }).catch(() => {
              setSubmissionError('Server returned an unknown error.');
          });
        }
      })
      .catch(() => {
        setIsLoading(false);
        setSubmissionError('Network error or server unreachable. Could not process booking.');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={{...styles.header, color: '#007bff'}}>New Room Booking 🛎️</h2>
      <p style={styles.subHeader}>Welcome, Guest #{currentUser?.id || 'N/A'}. Select your room and dates below.</p>
      
      <Formik
        initialValues={initialValues}
        validationSchema={BookingSchema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            
            {/* Room Selection Field */}
            <label htmlFor="room_id" style={styles.label}>Select Room</label>
            <Field as="select" id="room_id" name="room_id" style={styles.input}>
              <option value="" disabled>-- Select an Available Room --</option>
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.room_name} ({room.room_type}) - ${room.price.toFixed(2)}/night
                </option>
              ))}
            </Field>
            <ErrorMessage name="room_id" component="div" style={styles.errorMessageField} />

            {/* Check-in Date Field */}
            <label htmlFor="check_in_date" style={styles.label}>Check-in Date</label>
            <Field type="date" id="check_in_date" name="check_in_date" style={styles.input} />
            <ErrorMessage name="check_in_date" component="div" style={styles.errorMessageField} />

            {/* Check-out Date Field */}
            <label htmlFor="check_out_date" style={styles.label}>Check-out Date</label>
            <Field type="date" id="check_out_date" name="check_out_date" style={styles.input} />
            <ErrorMessage name="check_out_date" component="div" style={styles.errorMessageField} />

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading} 
              style={{...styles.button, backgroundColor: '#007bff'}}
            >
              {isLoading || isSubmitting ? 'Processing Booking...' : 'Confirm Booking'}
            </button>

            {submissionError && (
              <div style={styles.errorContainer}>
                <p style={styles.errorMessage}>Booking Error: {submissionError}</p>
              </div>
            )}
          </Form>
        )}
      </Formik>
      
      <p style={styles.footer}>
        <Link to="/guest/dashboard" style={{color: '#666'}}>Cancel and go back</Link>
      </p>
    </div>
  );
};

export default MakeBooking;

const styles = {
    container: {
        maxWidth: '500px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #dcdcdc',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        backgroundColor: '#f9f9f9',
    },
    header: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    subHeader: {
        textAlign: 'center',
        marginBottom: '25px',
        color: '#666',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: '600',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        padding: '12px',
        marginBottom: '5px', 
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '16px',
        backgroundColor: '#fff',
        transition: 'border-color 0.3s',
    },
    button: {
        padding: '12px',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '25px', 
        transition: 'background-color 0.3s',
    },
    errorContainer: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#ffe6e6',
        border: '1px solid #ff9999',
        borderRadius: '6px',
    },
    errorMessage: {
        margin: '5px 0',
        color: '#cc0000',
        fontSize: '14px',
    },
    errorMessageField: {
        color: '#cc0000',
        fontSize: '12px',
        marginBottom: '15px',
        marginTop: '2px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '25px',
        fontSize: '14px',
    }
};
