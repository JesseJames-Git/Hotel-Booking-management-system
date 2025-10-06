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

export default App;
