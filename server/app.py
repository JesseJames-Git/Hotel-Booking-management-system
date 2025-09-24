#!/usr/bin/env python3

# Remote library imports
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
# Local imports
from config import app, db, api

# Import your routes
from models import Hotel, Guest, Room, Booking  # Make sure this path matches your project structure

# Register API resources
class Hotels(Resource):
    def get(self):
        hotels = Hotel.query.all()
        data = [
            {
                "id": h.id,
                "name": h.name,
                "address": h.address,
                "city": h.city,
                "country": h.country,
                "phone": h.phone,
                "email": h.email
            } for h in hotels
        ]
        return jsonify(data)

    def post(self):
        data = request.get_json()
        hotel = Hotel(
            name=data.get("name"),
            address=data.get("address"),
            city=data.get("city"),
            country=data.get("country"),
            phone=data.get("phone"),
            email=data.get("email")
        )
        db.session.add(hotel)
        db.session.commit()
        return {"message": "Hotel created", "data": data}, 201


class HotelById(Resource):
    def get(self, id):
        hotel = Hotel.query.get_or_404(id)
        data = {
            "id": hotel.id,
            "name": hotel.name,
            "address": hotel.address,
            "city": hotel.city,
            "country": hotel.country,
            "phone": hotel.phone,
            "email": hotel.email
        }
        return jsonify(data)
        

    def put(self, id):
        hotel = Hotel.query.get_or_404(id)
        data = request.get_json()
        for key in data:
            setattr(hotel, key, data[key])
        db.session.commit()
        return {"message": f"Hotel {id} updated", "data": data}
        

    def delete(self, id):
        hotel = Hotel.query.get_or_404(id)
        db.session.delete(hotel)
        db.session.commit()
        return {"message": f"Hotel {id} deleted"}

    
class Users(Resource):
    def get(self):
        guests = Guest.query.all()
        data = [{"id": g.id, "name": g.name, "email": g.email, "phone": g.phone} for g in guests]
        return jsonify(data)
        
class Rooms(Resource):
    def get(self):
        rooms = Room.query.all()
        data = [
            {
                "id": r.id,
                "hotel_id": r.hotel_id,
                "room_number": r.room_number,
                "price_per_night": float(r.price_per_night),
                "is_available": r.is_available
            } for r in rooms
        ]
        return jsonify(data)
        
class Bookings(Resource):
    def get(self):
        bookings = Booking.query.all()
        data = [
            {
                "id": b.id,
                "guest_id": b.guest_id,
                "room_id": b.room_id,
                "check_in_date": str(b.check_in_date),
                "check_out_date": str(b.check_out_date),
                "status": b.status
            } for b in bookings
        ]
        return jsonify(data)
    
    

api.add_resource(Hotels, '/hotels')
api.add_resource(HotelById, '/hotels/<int:id>')
api.add_resource(Rooms, '/rooms')
api.add_resource(Bookings, '/bookings')
api.add_resource(Users, '/users')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
