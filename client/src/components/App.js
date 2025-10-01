import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import GuestHomePage from "./GuestHomePage";
import ViewHotels from "./ViewHotels";
import HotelDetails from "./HotelDetails";
import BookingForm from "./BookingForm";
import StartingPage from "./StartingPage";
import GuestLogin from "./GuestLogin";
import HotelAdminLogin from "./HotelAdminLogin";
import GuestSignUp from "./GuestSignup";
import AdminSignup from "./AdminSignup";

function App() {
  const [guest, setGuest] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [my_bookings, setBookings] = useState([]);


  useEffect(() => {
    fetch("/guests", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setGuest(data))
      .catch(() => setGuest(null));
  }, []);

  useEffect(() => {
    fetch("/admin", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setAdmin(data))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    if (guest) {
      fetch("/my_bookings", { credentials: "include" })
        .then((r) => r.json())
        .then(setBookings)
        .catch(() => setBookings([]));
    }
  }, [guest]);

  return (
    <Router>
      <div>
        <h1>Hotel Booking Management App</h1>
        <Switch>
          <Route exact path="/">
            {/* Redirect to proper home if logged in */}
            {guest ? <Redirect to="/guest/home" /> : admin ? <Redirect to="/admin/home" /> : <Redirect to="/home" />}
          </Route>

          <Route path="/home" component={StartingPage} />

          {/* Guest auth routes */}
          <Route path="/guest/signup" component={GuestSignUp} />
          <Route path="/guest/login">
            {guest ? <Redirect to="/guest/home" /> : <GuestLogin onGuestLogin={setGuest} />}
          </Route>

          {/* Admin auth routes */}
          <Route path="/admin/signup" component={AdminSignup} />
          <Route path="/admin/login">
            {admin ? <Redirect to="/admin/home" /> : <HotelAdminLogin onAdminLogin={setAdmin} />}
          </Route>

          {/* Guest home */}
          <Route path="/guest/home">
            {guest ? (
              <GuestHomePage guest={guest} setBookings={setBookings} my_bookings={my_bookings} />
            ) : (
              <Redirect to="/guest/login" />
            )}
          </Route>

          {/* Admin home */}
          <Route path="/admin/home">
            {admin ? (
              <h2>Welcome Admin {admin.name}</h2>
            ) : (
              <Redirect to="/admin/login" />
            )}
          </Route>

          {/* Hotels */}
          <Route exact path="/hotels" component={ViewHotels} />
          <Route path="/hotels/:id" component={HotelDetails} />

          {/* Booking */}
          <Route path="/book" component={BookingForm} />
          <Route
            path="/hotels/:hotelId/book"
            render={(props) => <BookingForm {...props} guestId={guest?.id} />}
          />

          <Route>
            <h2>404 - Page Not Found</h2>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}


export default App;
