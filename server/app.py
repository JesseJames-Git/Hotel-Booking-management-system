#!/usr/bin/env python3

# Remote library imports
from flask import request
from flask_restful import Resource

# Local imports
from config import app, db, api

# Import your routes
from routes.hotels import Hotels, HotelById
from routes.rooms import Rooms
from routes.bookings import Bookings
from routes.users import Users

# Root route
@app.route('/')
def index():
    return '<h1>Project Server</h1>'

# Register API resources
api.add_resource(Hotels, '/hotels')
api.add_resource(HotelById, '/hotels/<int:id>')
api.add_resource(Rooms, '/rooms')
api.add_resource(Bookings, '/bookings')
api.add_resource(Users, '/users')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
