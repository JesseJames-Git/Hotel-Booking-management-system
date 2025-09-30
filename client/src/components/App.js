import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import GuestHomePage from "./GuestHomePage";
import ViewHotels from "./ViewHotels";
import HotelDetails from "./HotelDetails";
import BookingForm from "./BookingForm";
import StartingPage from "./StartingPage";
import GuestSignIn from "./GuestSignIn";
import HotelAdminSignIn from "./HotelAdminSignIn";

function App() {
  const [guest, setGuest] = useState({});
  const [my_bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch('/guest')
      .then((r) => r.json())
      .then((data) => setGuest(data));
  }, []);

  useEffect(() => {
    fetch('/my_bookings')
      .then(r => r.json())
      .then(data => {
        console.log("Fetched bookings:", data);
        setBookings(data);
      });
  }, []);

  return (
    <Router>
      <div>
        <h1>Hotel Booking Management App</h1>

        <Switch>

          {/* Default: Redirect "/" to "/home" */}
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>

          <Route path="/home" component={StartingPage}/>

          {/* ----------------signup pages--------------- */}
          <Route path="/guest/signup" component={GuestSignIn}/>
          <Route path="/admin/signup" component={HotelAdminSignIn}/>


          {/* Home page (guest info + bookings) */}
          <Route path="/home/guest">
            <GuestHomePage
              guest={guest}
              setBookings={setBookings}
              my_bookings={my_bookings}
            />
          </Route>

          {/* Hotels list */}
          <Route exact path="/hotels" component={ViewHotels} />

          {/* Single hotel details */}
          <Route path="/hotels/:id" component={HotelDetails} />

          <Route path="/booking" component={BookingForm} />

          <Route
            path="/hotels/:hotelId/book"
            element={<BookingForm guestId={guest.id} />}
          />

        

          {/* Fallback for unknown routes */}
          <Route>
            <h2>404 - Page Not Found</h2>
          </Route>

        </Switch>
      </div>
    </Router>
  );
}

export default App;
