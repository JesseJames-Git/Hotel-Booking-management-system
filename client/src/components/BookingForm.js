import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup'; 
import '../styling/BookingForm.css';

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

    fetch(`/api/rooms/${hotelId}/available`) 
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

    fetch("/api/bookings", {
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
    <div className="booking-container">
      <h2 className="booking-header">🛎️ New Room Booking</h2>
      <p className="booking-subheader">Select a room to continue your reservation.</p>
      
      <Formik
        initialValues={initialValues}
        validationSchema={BookingSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="booking-form">
            {/* Room Selection */}
            <label htmlFor="roomId" className="form-label">Select Room</label>
            <Field 
              as="select" 
              id="roomId" 
              name="roomId" 
              className="form-input"
              disabled={isRoomsLoading || fetchError}
            >
              <option value="">-- Select a Room --</option>
              {renderRoomOptions()}
            </Field>
            <ErrorMessage name="roomId" component="div" className="form-error" />

            {/* Dates */}
            <label htmlFor="check_in_date" className="form-label">Check-in Date</label>
            <Field type="date" id="check_in_date" name="check_in_date" className="form-input" />
            <ErrorMessage name="check_in_date" component="div" className="form-error" />

            <label htmlFor="check_out_date" className="form-label">Check-out Date</label>
            <Field type="date" id="check_out_date" name="check_out_date" className="form-input" />
            <ErrorMessage name="check_out_date" component="div" className="form-error" />

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading || isRoomsLoading || availableRooms.length === 0} 
              className="submit-btn"
            >
              {isLoading || isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>

            {(submissionError || fetchError) && (
              <div className="error-box">
                <p className="error-text">⚠️ {submissionError || fetchError}</p>
              </div>
            )}
          </Form>
        )}
      </Formik>
      
      <p className="booking-footer">
        <Link to="/guest/home" className="cancel-link">← Cancel and go back</Link>
      </p>
    </div>
  );
};

export default BookingForm;
