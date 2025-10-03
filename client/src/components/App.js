import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Reservations from "./Reservations";
import Rooms from "./Rooms";
import Hotels from "./Hotels";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/reservations">Reservations</Link>
            </li>
            <li>
              <Link to="/rooms">Rooms</Link>
            </li>
            <li>
              <Link to="/hotels">Hotels</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/reservations">
            <Reservations />
          </Route>
          <Route path="/rooms">
            <Rooms />
          </Route>
          <Route path="/hotels">
            <Hotels />
          </Route>
          <Route path="/">
            <h1>Project Client</h1>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
