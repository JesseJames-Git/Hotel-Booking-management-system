from flask import request, jsonify, make_response, send_from_directory
from sqlalchemy.orm import joinedload
from config import app, db, api, Resource, reqparse, session, os
from models import( 
    Hotels, Guests, Rooms, Bookings, BookedRoom, 
    Admins, Amenities, HotelAmenities, RoomTypes)
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
            return make_response({'message': 'Login successful', 'guest':guest.to_dict(only=("id", "name", "email"))}, 200)
        else:
            return make_response({'Error 401': 'Invalid Email or Password'}, 401)

class CheckGuestSession(Resource):
    def get(self):
        guest_id = session.get('guest_id')

        if not guest_id:
            return make_response({'message': '401: Not authorized'}, 401)

        valid_guest = Guests.query.filter(Guests.id == guest_id).first()

        if valid_guest:
            return make_response(valid_guest.to_dict(only=("id", "name", "email")), 200)
        else:
            return make_response({'message': '401: Not authorized'}, 401)

        
class GuestLogout(Resource):
    def delete(self):
        session.pop('guest_id', None)
        return make_response({'message': '204: No Content'}, 204)
    


# Guests Resources
class GuestsList(Resource):
    def get(self):
        return [g.to_dict(only=("id", "name", "email")) for g in Guests.query.all()]

    def post(self):
        data = request.get_json()
        new_guest = Guests(
            name = data.get("name"),
            email =  data.get("email"),
        )
        new_guest.password_hash = data.get("password")

        db.session.add(new_guest)
        db.session.commit()
        
        return new_guest.to_dict(only=("id", "name", "email")), 201

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
        return guest.to_dict(only=("id", "name", "email"))

    def delete(self, id):
        guest = Guests.query.get_or_404(id)
        db.session.delete(guest)
        db.session.commit()
        return {"message": f"Guest {id} deleted"}, 200
    
    

# Room Resources
class RoomsList(Resource):
    def get(self):
        return [
            r.to_dict(
                only=(
                    "id",
                    "hotel_id",
                    "room_type.type_name",
                    "room_name",
                    "price_per_night",
                    "is_available",
                )
            )
            for r in Rooms.query.all()
        ]

    def post(self):
        data = request.get_json()

        required = ["room_name", "price_per_night", "hotel_id", "room_type", "description"]
        if not all(k in data for k in required):
            return {"error": "Missing required fields"}, 400

        room_type_name = data["room_type"].strip().title()
        room_type = RoomTypes.query.filter_by(type_name=room_type_name).first()

        if not room_type:
            room_type = RoomTypes(
                type_name=room_type_name,
                description=data["description"].strip()
            )
            db.session.add(room_type)
            db.session.commit()

        room = Rooms(
            room_name=data["room_name"],
            price_per_night=data["price_per_night"],
            hotel_id=data["hotel_id"],
            room_type_id=room_type.id,
            is_available=data.get("is_available", True)
        )

        db.session.add(room)
        db.session.commit()

        return (
            room.to_dict(
                only=("room_name", "price_per_night", "room_type.type_name", "is_available")
            ),
            201,
        )



class RoomsPerHotel(Resource):
    def get(self, hotel_id):
        rooms = Rooms.query.filter(Rooms.hotel_id == hotel_id).all()
        return make_response(
            jsonify(
                [
                    r.to_dict(
                        only=(
                            "id",
                            "room_name",
                            "room_type.type_name",
                            "hotel.id",
                            "is_available",
                            "price_per_night",
                        )
                    )
                    for r in rooms
                ]
            ),
            200,
        )


class SingleRoom(Resource):
    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument("is_available", type=bool, required=False)
        parser.add_argument("total_rooms", type=int, required=False)
        parser.add_argument("available_rooms", type=int, required=False)
        parser.add_argument("max_per_booking", type=int, required=False)
        data = parser.parse_args()

        room = Rooms.query.get(id)
        if not room:
            return {"error": "Room not found"}, 404

        if data["is_available"] is not None:
            room.is_available = data["is_available"]
        if data["total_rooms"] is not None:
            room.total_rooms = data["total_rooms"]
        if data["available_rooms"] is not None:
            room.available_rooms = data["available_rooms"]
        if data["max_per_booking"] is not None:
            room.max_per_booking = data["max_per_booking"]

        if room.available_rooms > room.total_rooms:
            return {"error": "Available rooms cannot exceed total rooms"}, 400

        if room.max_per_booking > room.available_rooms:
            return {"error": "Max per booking cannot exceed available rooms"}, 400

        db.session.commit()

        return {
            "message": "Room updated successfully",
            "room": {
                "id": room.id,
                "room_name": room.room_name,
                "is_available": room.is_available,
                "total_rooms": room.total_rooms,
                "available_rooms": room.available_rooms,
                "max_per_booking": room.max_per_booking,
            },
        }, 200

    def delete(self, id):
        room = Rooms.query.get_or_404(id)
        db.session.delete(room)
        db.session.commit()
        return make_response({"message": f"Room {id} deleted"}, 200)


# Room_types
class RoomTypesResource(Resource):
    def get(self):
        return make_response(
            jsonify(
                [
                    r.to_dict(only=("id", "type_name", "description"))
                    for r in RoomTypes.query.all()
                ]
            ),
            200,
        )


class AvailableRoomsPerHotel(Resource):
    def get(self, hotel_id):
        try:
            available_rooms = [
                r.to_dict(
                    only=(
                        "id",
                        "room_name",
                        "room_type.type_name",
                        "price_per_night",
                        "hotel.name",
                        "is_available",
                    )
                )
                for r in Rooms.query.filter(
                    Rooms.currently_available == True,
                    Rooms.is_available == True,
                    Rooms.hotel_id == hotel_id,
                ).all()
            ]

            return make_response(jsonify(available_rooms), 200)

        except Exception as e:
            return make_response(
                jsonify({"message": f"An error occurred fetching rooms: {str(e)}"}), 500
            )


# Booking Resources
class BookingListResource(Resource):
    def get(self):
        return [b.to_dict(only=("id", "guest_id", "check_in_date", "check_out_date", "status",)) 
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

        return booking.to_dict(only=("id", "guest_id", "check_in_date", "check_out_date", "status",)), 201



class GuestBookings(Resource):
    def get(self):

        guest_id = session.get("guest_id") 
        if not guest_id:
            return {"error": "Unauthorized"}, 401

        bookings = Bookings.query.filter_by(guest_id=guest_id).all()

        data = [b.to_dict(only=('id','rooms.hotel.name', 'rooms.room_name','rooms.price_per_night','rooms.room_type.type_name','check_in_date','check_out_date','status',))
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
        admin_id = session.get("admin_id")

        if guest_id:
            booking = Bookings.query.filter_by(id=booking_id, guest_id=guest_id).first()
        elif admin_id:
            booking = Bookings.query.filter_by(id=booking_id).first()
        else:
            return {"error": "Unauthorized"}, 403

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
                elif key == "status":
                    if value not in ["Pending", "Denied", "Confirmed"]:
                        return {"error": "Invalid status value"}, 400
                    setattr(booking, key, value)
                else:
                    setattr(booking, key, value)

        db.session.commit()

        result = {
            "id": booking.id,
            "status": booking.status,
            "check_in_date": booking.check_in_date.isoformat(),
            "check_out_date": booking.check_out_date.isoformat(),
            "guest": {
                "id": booking.guest.id,
                "name": booking.guest.name,
                "email": booking.guest.email
            } if booking.guest else None,
            "rooms": [
                {
                    "id": br.room.id,
                    "room_name": br.room.room_name,
                    "price_per_night": float(br.room.price_per_night),
                    "is_available": str(br.room.is_available),
                }
                for br in booking.booked_rooms
            ]
        }

        return make_response(jsonify(result), 200)


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
                'id','rooms.hotel.name','rooms.room_name', 'rooms.price_per_night',
                'rooms.room_type.type_name','check_in_date',
                'check_out_date','status',
            ))
            for b in bookings
        ]
        return make_response(jsonify(data), 200)


class BookingByHotelId(Resource):
    def get(self, hotel_id):
        bookings = (
            db.session.query(Bookings)
            .join(BookedRoom)
            .join(Rooms)
            .filter(Rooms.hotel_id == hotel_id)
            .options(
                joinedload(Bookings.guest),
                joinedload(Bookings.booked_rooms).joinedload(BookedRoom.room)
            )
            .all()
        )

        result = []
        for b in bookings:
            result.append({
                "id": b.id,
                "check_in_date": b.check_in_date.isoformat(),
                "check_out_date": b.check_out_date.isoformat(),
                "status": b.status,
                "guest": (
                    {
                        "id": b.guest.id,
                        "name": b.guest.name,
                        "email": b.guest.email,
                    }
                    if b.guest
                    else None
                ),
                "rooms": [
                    {
                        "id": br.room.id,
                        "room_name": br.room.room_name,
                        "price_per_night": float(br.room.price_per_night),
                        "is_available": str(br.room.is_available),
                    }
                    for br in b.booked_rooms
                ],
            })

        return make_response(jsonify(result), 200)


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
        admin_id = session.get("admin_id")
        if not admin_id:
            return {"error": "Unauthorized"}, 401
        
        existing_hotel = Hotels.query.filter_by(admin_id=admin_id).first()
        if existing_hotel:
            return {"error": "Admin already owns a hotel"}, 400        

        data = request.get_json()
        hotel = Hotels(
            name=data.get("name"),
            address=data.get("address"),
            city=data.get("city"),
            country=data.get("country"),
            phone=data.get("phone"),
            email=data.get("email"),
            admin_id=admin_id
        )
        db.session.add(hotel)
        db.session.commit()
        return hotel.to_dict(only=(
            "id",
            "name",
            "address",
            "city",
            "country",
            "email",
            "phone",
            "admin_id",
            "rooms.room_name",
            "rooms.room_type",
            "rooms.price_per_night",
            "rooms.is_available",
            "hotel_amenities",
        )), 201

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
            "hotel_amenities",
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
    
class AdminHotel(Resource):
    def get(self):
        admin_id = session.get("admin_id")

        if not admin_id:
            return {"error": "Unauthorized"}, 401
        
        my_hotel = Hotels.query.filter_by(admin_id=admin_id).first()

        return make_response(my_hotel.to_dict(only=(
            "id", "name", "city", "country", "email", "address", "phone",
            "rooms.id","rooms.room_name","rooms.is_available","rooms.price_per_night","rooms.room_type",
        )), 200)

    
        
# Admin Session Management
class AdminLogin(Resource):
    def post(self):
        data = request.get_json()
        admin = Admins.query.filter_by(name=data.get('name')).first()

        if admin and admin.authenticate(data.get('password')):
            session['admin_id'] = admin.id
            return make_response({'message': 'Login successful', 'admin':admin.to_dict(only=("id", "name"))}, 200)
        else:
            return make_response({'Error 401': 'Invalid Email or Password'}, 401)

class CheckAdminSession(Resource):
    def get(self):
        admin_id = session.get('admin_id')

        if not admin_id:
            return make_response({'message': '401: Not authorized'}, 401)

        valid_admin = Admins.query.filter(Admins.id == admin_id).first()

        if valid_admin:
            return make_response(valid_admin.to_dict(only=("id", "name")), 200)
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
        
        return new_admin.to_dict(only=("id", "name")), 201
    

# Amenities Resource
class HotelAmenitiesResource(Resource):
    def get(self, hotel_id):
        hotel = Hotels.query.get(hotel_id)
        if not hotel:
            return {"error": "Hotel not found"}, 404

        amenities = [
            ha.amenity.to_dict(only=("id", "name", "description"))
            for ha in hotel.hotel_amenities
        ]
        return amenities, 200


    def post(self, hotel_id):
        data = request.get_json()
        hotel = Hotels.query.get(hotel_id)
        if not hotel:
            return {"error": "Hotel not found"}, 404

        name = data.get("name")
        description = data.get("description")

        if not name or not description:
            return {"error": "Missing fields"}, 400

        amenity = Amenities.query.filter_by(name=name).first()
        if not amenity:
            amenity = Amenities(name=name, description=description)
            db.session.add(amenity)
            db.session.commit()

        existing_link = HotelAmenities.query.filter_by(
            hotel_id=hotel.id, amenity_id=amenity.id
        ).first()
        if existing_link:
            return {"error": f"Amenity '{name}' already exists for this hotel"}, 409

        link = HotelAmenities(hotel_id=hotel.id, amenity_id=amenity.id)
        db.session.add(link)
        db.session.commit()

        return {
            "message": "Amenity created and linked successfully",
            "amenity": amenity.to_dict(only=("id", "name", "description")),
        }, 201


    
    
# -----------------------------------Routes--------------------------------------


# Admins
api.add_resource(AdminsList, "/api/admins")
api.add_resource(AdminLogin, "/api/admin/login")
api.add_resource(CheckAdminSession, "/api/admin")
api.add_resource(AdminLogout, "/api/admin/logout")
api.add_resource(AdminHotel, "/api/admin/hotel")

# Hotels
api.add_resource(HotelsList, "/api/hotels")
api.add_resource(SingleHotel, "/api/hotels/<int:id>")

# Guests
api.add_resource(GuestsList, "/api/guests")
api.add_resource(SingleGuest, "/api/guests/<int:id>")
api.add_resource(GuestLogin, "/api/guests/login")
api.add_resource(CheckGuestSession, "/api/guest")
api.add_resource(GuestLogout, "/api/guests/logout")


# Rooms
api.add_resource(RoomsList, "/api/rooms")
api.add_resource(SingleRoom, "/api/rooms/<int:id>")
api.add_resource(AvailableRoomsPerHotel, "/api/rooms/<int:hotel_id>/available")
api.add_resource(RoomsPerHotel, "/api/hotels/<int:hotel_id>/rooms")

# RoomTypes
api.add_resource(RoomTypesResource, "/api/room_types")

# Bookings
api.add_resource(BookingListResource, "/api/bookings")
api.add_resource(GuestBookings, "/api/my_bookings")
api.add_resource(BookingById, "/api/bookings/<int:booking_id>")
api.add_resource(BookingByHotelId, "/api/hotels/<int:hotel_id>/bookings")

# HotelAmenities
api.add_resource(HotelAmenitiesResource, "/api/hotel/<int:hotel_id>/amenities")


BUILD_DIR = os.path.join(app.root_path, "static")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(BUILD_DIR, path)):
        return send_from_directory(BUILD_DIR, path)
    else:
        return send_from_directory(BUILD_DIR, "index.html")



if __name__ == '__main__':
    app.run(port=5555, debug=True)