import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  useHistory,
} from "react-router-dom";
import Reservations from "./Reservations";
import Hotel from "./Hotel";
import AddHotel from "./AddHotel";

function App() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the logged-in admin's hotel
  useEffect(() => {
    fetch("/my_hotel")
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
          <Link to="/hotels/1/reservations">Reservations</Link>
        </nav>

        <Switch>
          {/* Show AddHotel if admin doesn't have one */}
          <Route path="/hotel">
            {hotel ? (
              <Hotel hotel={hotel} />
            ) : (
              <AddHotel onHotelAdded={setHotel} />
            )}
          </Route>

          <Route path="/hotels/:hotelId/reservations" component={Reservations} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
