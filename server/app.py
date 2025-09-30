from flask import request, jsonify, make_response
from config import app, db, api, Resource, session
from models import Hotels, Guests, Rooms, Bookings, BookedRoom
from datetime import datetime

def is_room_available(room_id: int, check_in: datetime, check_out: datetime) -> bool:
    conflict = (
        Bookings.query
        .join(BookedRoom)
        .filter(
            BookedRoom.room_id == room_id,
            Bookings.check_in_date < check_out,
            Bookings.check_out_date > check_in
        )
        .first()
    )
    return conflict is None


# --------------------------------------Resources-----------------------------------------

# Guest Session management
class GuestLogin(Resource):
    def post(self):
        data = request.get_json()
        guest = Guests.query.filter_by(email=data.get('email')).first()

        if guest and guest.authenticate(data.get('password')):
            session['guest_id'] = guest.id
            return make_response({'message': 'Login sucessful', 'guest':guest.to_dict()}, 200)
        else:
            return make_response({'Error 401': 'Invalid Email or Password'}, 401)

class CheckGuestSession(Resource):
    def get(self):
        valid_guest = Guests.query.filter(Guests.id == 2).first()

        if valid_guest:
            return make_response(valid_guest.to_dict(), 200)
        else:
            return make_response({'message':'401: Not authorized'}, 401)
        
class GuestLogout(Resource):
    def delete(self):
        session.pop('guest_id', None)
        return make_response({'message': '204: No Content'}, 204)
    
    
# Guests Resources
class GuestsList(Resource):
    def get(self):
        return [g.to_dict() for g in Guests.query.all()]

    def post(self):
        data = request.get_json()
        new_guest = Guests(
            name = data.get("name"),
            email =  data.get("email"),
        )
        new_guest.password_hash = data.get("password")

        db.session.add(new_guest)
        db.session.commit()
        
        return new_guest.to_dict(), 201

class SingleGuest(Resource):
    def get(self, id):
        return Guests.query.get_or_404(id).to_dict()

    def patch(self, id):
        guest = Guests.query.get_or_404(id)
        data = request.get_json()
        for key, value in data.items():
            if hasattr(guest, key):
                setattr(guest, key, value)
        db.session.commit()
        return guest.to_dict()

    def delete(self, id):
        guest = Guests.query.get_or_404(id)
        db.session.delete(guest)
        db.session.commit()
        return {"message": f"Guest {id} deleted"}, 200
    
    

# Room Resources
class RoomsList(Resource):
    def get(self):
        return [r.to_dict() for r in Rooms.query.all()]

    def post(self):
        data = request.get_json()
        room = Rooms(
            number=data.get("number"),
            type=data.get("type"),
            price=data.get("price"),
            is_available=data.get("is_available", True),
            hotel_id=data.get("hotel_id"),
        )
        db.session.add(room)
        db.session.commit()
        return room.to_dict(), 201

class SingleRoom(Resource):
    def patch(self, id):
        room = Rooms.query.get_or_404(id)
        data = request.get_json()
        for key, value in data.items():
            if hasattr(room, key):
                setattr(room, key, value)
        db.session.commit()
        return room.to_dict()

    def delete(self, id):
        room = Rooms.query.get_or_404(id)
        db.session.delete(room)
        db.session.commit()
        return make_response({"message": f"Room {id} deleted"}, 200)
    
    

# Booking Resources
class BookingListResource(Resource):
    def get(self):
        return [b.to_dict() 
                for b in Bookings.query.all()]

    def post(self):
        data = request.get_json()
        booking = Bookings(
            guest_id=data.get("guest_id"),
            room_id=data.get("room_id"),
            check_in=datetime.fromisoformat(data.get("check_in")),
            check_out=datetime.fromisoformat(data.get("check_out")),
            status=data.get("status", "pending"),
        )
        db.session.add(booking)
        db.session.commit()
        return make_response(booking.to_dict(), 201)

class GuestBookings(Resource):
    def get(self):

        guest_id = session.get("guest_id") or 2 
        if not guest_id:
            return {"error": "Unauthorized"}, 401

        bookings = Bookings.query.filter_by(guest_id=guest_id).all()

        data = [b.to_dict(only=('id','rooms.hotel.name', 'rooms.room_name','rooms.room_type.type_name','check_in_date','check_out_date','status',))
                for b in bookings]
        return make_response(jsonify(data), 200)
    

    def post(self):
        data = request.get_json()
        try:
            guest_id = data.get("guest_id")
            hotel_id = data.get("hotel_id")
            check_in_date = data.get("check_in_date")
            check_out_date = data.get("check_out_date")
            guests = data.get("guests")
            booked_rooms = data.get("booked_rooms", [])

            if not (guest_id and hotel_id and check_in_date and check_out_date and guests):
                return {"error": "Missing required fields"}, 400

            new_booking = Bookings(
                guest_id=guest_id,
                hotel_id=hotel_id,
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                guests=guests
            )
            db.session.add(new_booking)
            db.session.commit()

            created_booked_rooms = []
            for br in booked_rooms:
                if br.get("quantity", 0) > 0:
                    booked_room = BookedRoom(
                        booking_id=new_booking.id,
                        room_id=br["room_id"],
                        quantity=br["quantity"]
                    )
                    db.session.add(booked_room)
                    created_booked_rooms.append(booked_room)

            db.session.commit()

            return {
                "id": new_booking.id,
                "guest_id": new_booking.guest_id,
                "hotel_id": new_booking.hotel_id,
                "check_in_date": str(new_booking.check_in_date),
                "check_out_date": str(new_booking.check_out_date),
                "guests": new_booking.guests,
                "booked_rooms": [
                    {"id": br.id, "room_id": br.room_id, "quantity": br.quantity}
                    for br in created_booked_rooms
                ]
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

class BookingById(Resource):
    def patch(self, booking_id):
        guest_id = session.get("guest_id") or 2

        booking = Bookings.query.filter_by(id=booking_id, guest_id=guest_id).first()
        if not booking:
            return {"error": "Booking not found or unauthorized"}, 404

        data = request.get_json()

        for key, value in data.items():
            if hasattr(booking, key):
                if key in ["check_in_date", "check_out_date"]:
                    try:
                        setattr(booking, key, datetime.fromisoformat(value))
                    except ValueError:
                        return {"error": f"Invalid date format for {key}"}, 400
                else:
                    setattr(booking, key, value)

        db.session.commit()
        return make_response(jsonify(booking.to_dict(only=(
            'id','rooms.hotel.name', 'rooms.room_name','rooms.room_type.type_name','check_in_date','check_out_date','status',)
        )), 200)

    def delete(self, booking_id):
        guest_id = session.get("guest_id") or 2

        booking = Bookings.query.filter_by(id=booking_id, guest_id=guest_id).first()
        if not booking:
            return {"error": "Booking not found or unauthorized"}, 404

        db.session.delete(booking)
        db.session.commit()

        bookings = Bookings.query.filter_by(guest_id=guest_id).all()
        data = [
            b.to_dict(only=(
                'id','rooms.hotel.name','rooms.room_name',
                'rooms.room_type.type_name','check_in_date',
                'check_out_date','status',
            ))
            for b in bookings
        ]
        return make_response(jsonify(data), 200)



# Hotel Resources
class HotelsList(Resource):
    def get(self):
        return [h.to_dict(only=(
            "id",
            "name",
            "address",
            "city",
            "country",
            "email",
            "phone"
        ))for h in Hotels.query.all()]

    def post(self):
        data = request.get_json()
        hotel = Hotels(
            name=data.get("name"),
            address=data.get("address"),
            city=data.get("city"),
            country=data.get("country"),
            phone=data.get("phone"),
            email=data.get("email"),
        )
        db.session.add(hotel)
        db.session.commit()
        return hotel.to_dict(), 201

class SingleHotel(Resource):
    def get(self, id):
        hotel = Hotels.query.get_or_404(id)
        return make_response(hotel.to_dict(only=(
            "id",
            "name",
            "address",
            "city",
            "country",
            "email",
            "phone",
            "rooms.room_name",
            "rooms.room_type",
            "rooms.price_per_night",
            "rooms.is_available",
            "hotel_amenities"
        )), 200)

    def put(self, id):
        hotel = Hotels.query.get_or_404(id)
        data = request.get_json()
        for key, value in data.items():
            setattr(hotel, key, value)
        db.session.commit()
        return hotel.to_dict()

    def delete(self, id):
        hotel = Hotels.query.get_or_404(id)
        db.session.delete(hotel)
        db.session.commit()
        return {"message": f"Hotel {id} deleted"}, 200
        

# -----------------------------------Routes--------------------------------------

# Hotels
api.add_resource(HotelsList, "/hotels")
api.add_resource(SingleHotel, "/hotels/<int:id>")

# Guests
api.add_resource(GuestsList, "/guests")
api.add_resource(SingleGuest, "/guests/<int:id>")
api.add_resource(GuestLogin, "/guests/login")
api.add_resource(CheckGuestSession, "/guest")
api.add_resource(GuestLogout, "/guests/logout")


# Rooms
api.add_resource(RoomsList, "/rooms")
api.add_resource(SingleRoom, "/rooms/<int:id>")

# Bookings
api.add_resource(BookingListResource, "/bookings")
api.add_resource(GuestBookings, "/my_bookings")
api.add_resource(BookingById, "/bookings/<int:booking_id>")



if __name__ == '__main__':
    app.run(port=5555, debug=True)