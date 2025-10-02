from flask import request, jsonify, make_response
from config import app, db, api, Resource, session
from models import Hotels, Guests, Rooms, Bookings, BookedRoom, Admins
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
            return make_response({'message': 'Login successful', 'guest':guest.to_dict()}, 200)
        else:
            return make_response({'Error 401': 'Invalid Email or Password'}, 401)

class CheckGuestSession(Resource):
    def get(self):
        guest_id = session.get('guest_id')

        if not guest_id:
            return make_response({'message': '401: Not authorized'}, 401)

        valid_guest = Guests.query.filter(Guests.id == guest_id).first()

        if valid_guest:
            return make_response(valid_guest.to_dict(), 200)
        else:
            return make_response({'message': '401: Not authorized'}, 401)

        
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
    
class RoomsPerHotel(Resource):
    def get(self, hotel_id):
        return make_response(jsonify([r.to_dict(only=("id", "room_name", "room_type.type_name", "price_per_night")) for r in Rooms.query.filter(Rooms.hotel_id==hotel_id).all()]), 200)

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
    
class AvailableRoomsPerHotel(Resource):
    def get(self, hotel_id):
        try:
            available_rooms = [r.to_dict(
                only=("id", "room_name", "room_type.type_name", "price_per_night", "hotel.name", "is_available")) 
                               for r in Rooms.query.filter(
                                   Rooms.currently_available == True, Rooms.is_available == True, Rooms.hotel_id == hotel_id).all()]

            return make_response(jsonify(available_rooms), 200)

        except Exception as e:
            return make_response(jsonify({"message": f"An error occurred fetching rooms: {str(e)}"}), 500)

# Booking Resources
class BookingListResource(Resource):
    def get(self):
        return [b.to_dict() 
                for b in Bookings.query.all()]

    def post(self):
        data = request.get_json()
        
        booking = Bookings(
            guest_id=data["guest_id"],
            check_in_date=datetime.fromisoformat(data["check_in"]),
            check_out_date=datetime.fromisoformat(data["check_out"]),
            status="pending"
        )
        db.session.add(booking)
        db.session.commit() 

        booked_room = BookedRoom(
            booking_id=booking.id,
            room_id=data["room_id"]
        )
        db.session.add(booked_room)
        db.session.commit()

        return booking.to_dict(), 201



class GuestBookings(Resource):
    def get(self):

        guest_id = session.get("guest_id") 
        if not guest_id:
            return {"error": "Unauthorized"}, 401

        bookings = Bookings.query.filter_by(guest_id=guest_id).all()

        data = [b.to_dict(only=('id','rooms.hotel.name', 'rooms.room_name','rooms.room_type.type_name','check_in_date','check_out_date','status',))
                for b in bookings]
        return make_response(jsonify(data), 200)
    
    def post(self):
        guest_id = session.get("guest_id")
        if not guest_id:
            return {"error": "Unauthorized"}, 401

        data = request.get_json()
        room_id = data.get("room_id")
        check_in = datetime.fromisoformat(data.get("check_in"))
        check_out = datetime.fromisoformat(data.get("check_out"))

        if not is_room_available(room_id, check_in, check_out):
            return {"error": "Room is not available for the selected dates"}, 400

        new_booking = Bookings(
            guest_id=guest_id,
            room_id=room_id,
            check_in_date=check_in,
            check_out_date=check_out,
            status=data.get("status", "pending"),
        )
        db.session.add(new_booking)
        db.session.commit()

        return make_response(new_booking.to_dict(only=(
            'id','rooms.hotel.name', 'rooms.room_name','rooms.room_type.type_name','check_in_date','check_out_date','status',)
        ), 201)

class BookingById(Resource):
    def patch(self, booking_id):
        guest_id = session.get("guest_id")

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
        guest_id = session.get("guest_id") 

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
    
        
# Admin Session Management
class AdminLogin(Resource):
    def post(self):
        data = request.get_json()
        admin = Admins.query.filter_by(name=data.get('name')).first()

        if admin and admin.authenticate(data.get('password')):
            session['admin_id'] = admin.id
            return make_response({'message': 'Login successful', 'admin':admin.to_dict()}, 200)
        else:
            return make_response({'Error 401': 'Invalid Email or Password'}, 401)

class CheckAdminSession(Resource):
    def get(self):
        admin_id = session.get('admin_id')

        if not admin_id:
            return make_response({'message': '401: Not authorized'}, 401)

        valid_admin = Admins.query.filter(Admins.id == admin_id).first()

        if valid_admin:
            return make_response(valid_admin.to_dict(), 200)
        else:
            return make_response({'message': '401: Not authorized'}, 401)

        
class AdminLogout(Resource):
    def delete(self):
        session.pop('admin_id', None)
        return make_response({'message': '204: No Content'}, 204)
    
    
# Admin Resource
class AdminsList(Resource):
    def get(self):
        return make_response(jsonify([a.to_dict() for a in Admins.query.all()]), 200)
    
    def post(self):
        data = request.get_json()
        new_admin = Admins(name = data.get("name"))
        new_admin.password_hash = data.get("password")

        db.session.add(new_admin)
        db.session.commit()
        
        return new_admin.to_dict(), 201
    
        
# -----------------------------------Routes--------------------------------------


# Admins
api.add_resource(AdminsList, "/admins")
api.add_resource(AdminLogin, "/admin/login")
api.add_resource(CheckAdminSession, "/admin")
api.add_resource(AdminLogout, "/admin/logout")

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
api.add_resource(AvailableRoomsPerHotel, "/rooms/<int:hotel_id>/available")
api.add_resource(RoomsPerHotel, "/hotels/<int:hotel_id>/rooms")

# Bookings
api.add_resource(BookingListResource, "/bookings")
api.add_resource(GuestBookings, "/my_bookings")
api.add_resource(BookingById, "/bookings/<int:booking_id>")



if __name__ == '__main__':
    app.run(port=5555, debug=True)