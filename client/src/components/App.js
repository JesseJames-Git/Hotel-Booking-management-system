import React, { useEffect, useState } from "react";
import {BrowserRouter as Router, Route, Switch, Link, useHistory} from "react-router-dom"
import Reservations from "./Reservations";

function App() {
  return(
    <div>
      <h1>Hotel Booking Management App</h1>
      <Router>
        <Switch>

          <Route path="/hotels/:hotelId/reservations" component={Reservations}/>

        </Switch>
      </Router>
    </div>
  )
}

export default App;
