import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom"
import GuestHomePage from "./GuestHomePage"
import NavBar from "./NavBar"
import ViewHotels from "./ViewHotels"
import HotelDetails from "./HotelDetails"
import BookingForm from "./BookingForm"
import StartingPage from "./StartingPage"
import GuestLogin from "./GuestLogin"
import HotelAdminLogin from "./HotelAdminLogin"
import GuestSignUp from "./GuestSignup"
import AdminSignup from "./AdminSignup"

function App() {
  const [user, setUser] = useState(null) 
  const [my_bookings, setBookings] = useState([])
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch("/guest", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setUser({ ...data, role: "guest" }))
      .catch(() => {})
  }, [])


  useEffect(() => {
    fetch("/admin", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setUser({ ...data, role: "admin" }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.role === "guest") {
      fetch("/my_bookings", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setBookings(d))
        .catch(() => setBookings([]))
    }
  }, [user])

    
  useEffect(() => {
    fetch("/hotels")
      .then((r) => r.json())
      .then((d) => setHotels(d));
  }, []);
  
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
} from "react-router-dom";
import Reservations from "./Reservations";
import Hotel from "./Hotel";
import AddHotel from "./AddHotel";
import AddAmenities from "./AddAmenities";
import ViewRooms from "./ViewRooms";
import AddRoom from "./AddRoom"

function App() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/hotel")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.message) {
          setHotel(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hotel:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h3>Loading...</h3>;

  return (
    <Router>
      <div>
        <NavBar user={user} setUser={setUser} />
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

          {/* Landing page */}
          <Route exact path="/home" component={StartingPage} />

          {/* Guest auth */}
          <Route path="/guest/signup" component={GuestSignUp} />
          <Route path="/guest/login">
            {user?.role === "guest" ? (
              <Redirect to="/guest/home" />
            ) : (
              <GuestLogin onGuestLogin={(guest) => setUser({ ...guest, role: "guest" })} />
            )}
          </Route>

          {/* Admin auth */}
          <Route path="/admin/signup" component={AdminSignup} />
          <Route path="/admin/login">
            {user?.role === "admin" ? (
              <Redirect to="/admin/home" />
            ) : (
              <HotelAdminLogin onAdminLogin={(admin) => setUser({ ...admin, role: "admin" })} />
            )}
          </Route>

          {/* Guest home */}
          <Route path="/guest/home">
            {user?.role === "guest" ? (
              <GuestHomePage
                guest={user}
                setBookings={setBookings}
                my_bookings={my_bookings}
              />
            ) : (
              <Redirect to="/guest/login" />
            )}
          </Route>

          {/* Admin home */}
          <Route path="/admin/home">
            {user?.role === "admin" ? (
              <h2>Welcome Admin {user.name}</h2>
            ) : (
              <Redirect to="/admin/login" />
            )}
          </Route>

          {/* Hotels list */}
          <Route exact path="/hotels">
            <ViewHotels hotels={hotels} />
          </Route>

          {/* Hotel details */}
          <Route exact path="/hotels/:id" component={HotelDetails} />

          {/* Booking form */}
          <Route
            path="/hotels/:id/book"
            render={(props) => <BookingForm {...props} currentUser={user} />}
          />

          {/* 404 fallback */}
          <Route>
            <h2>404 - Page Not Found</h2>
          </Route>
        </Switch>

      </div>
    </Router>
  )
        <h1>Hotel Booking Management App</h1>
        <nav style={{ marginBottom: "1em" }}>
          <Link to="/hotel" style={{ marginRight: "1em" }}>
            My Hotel
          </Link>
          <Link to="/hotels/1/reservations" style={{ marginRight: "1em" }}>Reservations</Link>
          <Link to="/admin/add_amenities" style={{ marginRight: "1em" }}> Add Amenities</Link>
          <Link to="/admin/hotel/rooms" style={{ marginRight: "1em" }}>View Rooms</Link>
        </nav>

        <Switch>

          <Route path="/hotel">
            {hotel ? (
              <Hotel hotel={hotel} />
            ) : (
              <AddHotel onHotelAdded={setHotel} />
            )}
          </Route>

          <Route path="/admin/add_amenities">
            <AddAmenities hotel={hotel}/>
          </Route>
          <Route path="/hotels/:hotelId/reservations" component={Reservations} />

          <Route path="/admin/hotel/rooms">
            <ViewRooms hotel={hotel}/>
          </Route>
          <AddRoom hotel={hotel}/>

        </Switch>
      </div>
    </Router>
  );
}

export default App
