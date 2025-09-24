#!/usr/bin/env python3

# Remote library imports
from flask import Flask, request
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
# Local imports
from config import app, db, api

# Import your routes
from routes.hotels import Hotels, HotelById
from routes.rooms import Rooms
from routes.bookings import Bookings
from routes.users import Users

# Root route
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///hotel.db"
db = SQLAlchemy(app)
api = Api(app)
# Register API resources
api.add_resource(Hotels, '/hotels')
api.add_resource(HotelById, '/hotels/<int:id>')
api.add_resource(Rooms, '/rooms')
api.add_resource(Bookings, '/bookings')
api.add_resource(Users, '/users')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
