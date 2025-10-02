import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup'; 

// --- Yup Validation Schema ---
const BookingSchema = yup.object().shape({
  roomId: yup.string().required('Please select a room.'),
  check_in_date: yup.date()
    .required('Check-in date is required.')
    .min(new Date(), 'Check-in cannot be in the past.'),
  check_out_date: yup.date()
    .required('Check-out date is required.')
    .min(yup.ref('check_in_date'), 'Check-out date must be after Check-in date.'),
});

const BookingForm = ({ currentUser, onBookingSuccess }) => {
  const { id: hotelId } = useParams();
  const [submissionError, setSubmissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]); 
  const history = useHistory();

  useEffect(() => {
    if (!hotelId) {
      setFetchError("Hotel ID is required to fetch rooms.");
      setIsRoomsLoading(false);
      return;
    }

    setIsRoomsLoading(true);
    setFetchError(null);

    fetch(`/rooms/${hotelId}/available`) 
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch rooms.');
      })
      .then((roomsData) => setAvailableRooms(roomsData))
      .catch((error) => {
        console.error("Fetch Rooms Error:", error);
        setFetchError('Could not load available rooms from the server.');
      })
      .finally(() => setIsRoomsLoading(false));
  }, [hotelId]); 

  const initialValues = {
    roomId: '',
    check_in_date: '',
    check_out_date: '',
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setIsLoading(true);
    setSubmissionError(null);

    if (!currentUser || !currentUser.id) {
      setSubmissionError("Authentication error: Guest ID is missing. Please log in.");
      setIsLoading(false);
      setSubmitting(false)
      return;
    }
    
    const payload = {
      guest_id: currentUser.id,
      hotel_id: parseInt(hotelId, 10),
      room_id: parseInt(values.roomId, 10),
      check_in: values.check_in_date,
      check_out: values.check_out_date, 
    };

    fetch("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json().then((newBooking) => {
            if (onBookingSuccess) onBookingSuccess(newBooking);
            history.push("/guest/home");
          });
        } else {
          res.json()
            .then((err) => {
              setSubmissionError(err.message || 'Booking failed.') 
            }) 
            .catch(() => {
              setSubmissionError('Server returned an unknown error.')              
            });
        }
      })
      .catch(() => {
        setIsLoading(false);
        setSubmissionError('Network error or server unreachable.');
      })
    .finally(() => {
      setIsLoading(false);
      setSubmitting(false);
    });
  };

  const renderRoomOptions = () => {
    if (isRoomsLoading) return <option disabled>Loading rooms...</option>;
    if (fetchError) return <option disabled>{fetchError}</option>;
    if (availableRooms.length === 0) return <option disabled>No rooms available</option>;

    return availableRooms.map(room => (
      <option key={room.id} value={String(room.id)}>
        {room.room_name} ({room.room_type?.type_name}) - ${parseFloat(room.price_per_night).toFixed(2)}/ night
      </option>
    ));
  };

  return (
    <div style={styles.container}>
      <h2 style={{...styles.header, color: '#007bff'}}>New Room Booking</h2>
      <p style={styles.subHeader}>
        Select a room to continue.
      </p>
      
      <Formik
        initialValues={initialValues}
        validationSchema={BookingSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            {/* Room Selection */}
            <label htmlFor="roomId" style={styles.label}>Select Room</label>
            <Field 
              as="select" 
              id="roomId" 
              name="roomId" 
              style={styles.input}
              disabled={isRoomsLoading || fetchError}
            >
              <option value="">-- Select a Room --</option>
              {renderRoomOptions()}
            </Field>
            <ErrorMessage name="roomId" component="div" style={styles.errorMessageField} />

            {/* Dates */}
            <label htmlFor="check_in_date" style={styles.label}>Check-in Date</label>
            <Field type="date" id="check_in_date" name="check_in_date" style={styles.input} />
            <ErrorMessage name="check_in_date" component="div" style={styles.errorMessageField} />

            <label htmlFor="check_out_date" style={styles.label}>Check-out Date</label>
            <Field type="date" id="check_out_date" name="check_out_date" style={styles.input} />
            <ErrorMessage name="check_out_date" component="div" style={styles.errorMessageField} />

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading || isRoomsLoading || availableRooms.length === 0} 
              style={{...styles.button, backgroundColor: '#007bff'}}
            >
              {isLoading || isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>

            {(submissionError || fetchError) && (
              <div style={styles.errorContainer}>
                <p style={styles.errorMessage}>Error: {submissionError || fetchError}</p>
              </div>
            )}
          </Form>
        )}
      </Formik>
      
      <p style={styles.footer}>
        <Link to="/guest/home" style={{color: '#666'}}>Cancel and go back</Link>
      </p>
    </div>
  );
};

export default BookingForm;

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
