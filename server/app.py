#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request
from flask_restful import Resource
# Local imports
from config import app, db, api
# Add your model imports
from routes.hotels import Hotels, HotelById
from routes.rooms import Rooms
from routes.bookings import Bookings
from routes.users import Users
from models import User, Hotel, Room, Booking
# Views go here!
@app.route('/')
def index():
    return '<h1>Project Server</h1>'


if __name__ == '__main__':
    app.run(port=5555, debug=True)

