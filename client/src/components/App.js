import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import NavBar from "./NavBar";
import StartingPage from "./StartingPage";
import GuestHomePage from "./GuestHomePage";
import GuestLogin from "./GuestLogin";
import GuestSignUp from "./GuestSignup";
import HotelAdminLogin from "./HotelAdminLogin";
import AdminSignup from "./AdminSignup";
import ViewHotels from "./ViewHotels";
import HotelDetails from "./HotelDetails";
import BookingForm from "./BookingForm";
import AdminHomePage from "./AdminHomePage";
import Reservations from "./Reservations";
import Hotel from "./Hotel";
import AddHotel from "./AddHotel";
import AddAmenities from "./AddAmenities";
import ViewRooms from "./ViewRooms";
import AddRoom from "./AddRoom";

function App() {
  const [user, setUser] = useState(null);
  const [my_bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let res = await fetch("/guest", { credentials: "include" });
        if (res.ok) {
          let data = await res.json();
          setUser({ ...data, role: "guest" });
          setLoading(false);
          return;
        }

        res = await fetch("/admin", { credentials: "include" });
        if (res.ok) {
          let data = await res.json();
          setUser({ ...data, role: "admin" });
          setLoading(false);
          return;
        }

        setUser(null);
        setLoading(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.role === "guest") {
      fetch("/my_bookings", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setBookings(d))
        .catch(() => setBookings([]));
    }
  }, [user]);

  useEffect(() => {
    fetch("/hotels")
      .then((r) => r.json())
      .then((d) => setHotels(d))
      .catch(() => setHotels([]));
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      setLoading(true);
      fetch("/admin/hotel", { credentials: "include" })
        .then((r) => {
          if (!r.ok) throw new Error("No hotel found");
          return r.json();
        })
        .then((data) => {
          setHotel(data);
          setLoading(false);
        })
        .catch(() => {
          setHotel(null);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <Router>
      <div>
        <NavBar user={user} setUser={setUser} hotel={hotel} />

        <Switch>
          {/* Root redirect */}
          <Route exact path="/">
            {user?.role === "guest" ? (
              <Redirect to="/guest/home" />
            ) : user?.role === "admin" ? (
              <Redirect to="/admin/home" />
            ) : (
              <Redirect to="/home" />
            )}
          </Route>

          {/* Landing Page */}
          <Route exact path="/home" component={StartingPage} />

          {/* Guest Authentication */}
          <Route path="/guest/signup" component={GuestSignUp} />
          <Route path="/guest/login">
            {user?.role === "guest" ? (
              <Redirect to="/guest/home" />
            ) : (
              <GuestLogin onGuestLogin={(guest) => setUser({ ...guest, role: "guest" })} />
            )}
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/signup" component={AdminSignup} />
          <Route path="/admin/login">
            {user?.role === "admin" ? (
              <Redirect to="/admin/home" />
            ) : (
              <HotelAdminLogin onAdminLogin={(admin) => setUser({ ...admin, role: "admin" })} />
            )}
          </Route>

          {/* Guest Home */}
          <Route path="/guest/home">
            {user?.role === "guest" ? (
              <GuestHomePage guest={user} setBookings={setBookings} my_bookings={my_bookings} />
            ) : (
              <Redirect to="/guest/login" />
            )}
          </Route>

          {/* Hotels List */}
          <Route exact path="/hotels">
            <ViewHotels hotels={hotels} />
          </Route>

          {/* Hotel Details */}
          <Route exact path="/hotels/:id" component={HotelDetails} />

          {/* Booking Form */}
          <Route
            path="/hotels/:id/book"
            render={(props) => <BookingForm {...props} currentUser={user} />}
          />

          {/* ----------------- Admin Routes ----------------- */}
          <Route path="/admin/home">
            {user?.role === "admin" ? (
              <AdminHomePage user={user} hotel={hotel}/>
            ) : (
              <Redirect to="/admin/login" />
            )}
          </Route>

          <Route exact path="/admin/hotel">
            {user?.role === "admin" ? (
              hotel ? (
                <Hotel hotel={hotel} />
              ) : (
                <Redirect to="/admin/add_hotel" />
              )
            ) : (
              <Redirect to="/admin/login" />
            )}
          </Route>

          <Route exact path="/admin/add_hotel">
            <AddHotel onHotelAdded={setHotel} user={user} />
          </Route>

          <Route path="/admin/add_amenities">
            <AddAmenities hotel={hotel} />
          </Route>

          <Route path="/hotel/:hotelId/reservations" component={Reservations} />

          <Route path="/admin/hotel/rooms">
            <ViewRooms hotel={hotel} />
          </Route>

          <Route>
            <AddRoom hotel={hotel} />
          </Route>


          {/* 404 fallback */}
          <Route>
            <h2 style={{ textAlign: "center" }}>404 - Page Not Found</h2>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
