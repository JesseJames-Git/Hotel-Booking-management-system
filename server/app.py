from flask import request, jsonify
from config import app, db
from models import Hotels, Guests, Rooms, Bookings  


@app.route("/hotels", methods=["GET"])
def get_hotels():
    hotels = Hotels.query.all()
    return jsonify([h.to_dict() for h in hotels])

@app.route("/hotels", methods=["POST"])
def create_hotel():
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
    return jsonify(hotel.to_dict()), 201

@app.route("/hotels/<int:id>", methods=["GET"])
def get_hotel(id):
    hotel = Hotels.query.get_or_404(id)
    return jsonify(hotel.to_dict())

@app.route("/hotels/<int:id>", methods=["PUT"])
def update_hotel(id):
    hotel = Hotels.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        setattr(hotel, key, value)
    db.session.commit()
    return jsonify(hotel.to_dict())

@app.route("/hotels/<int:id>", methods=["DELETE"])
def delete_hotel(id):
    hotel = Hotels.query.get_or_404(id)
    db.session.delete(hotel)
    db.session.commit()
    return {"message": f"Hotel {id} deleted"}, 200

@app.route("/users", methods=["GET"])
def get_users():
    guests = Guests.query.all()
    return jsonify([g.to_dict() for g in guests])

@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    guest = Guests(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
    )
    db.session.add(guest)
    db.session.commit()
    return jsonify(guest.to_dict()), 201

@app.route("/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    guest = Guests.query.get_or_404(id)
    db.session.delete(guest)
    db.session.commit()
    return {"message": f"User {id} deleted"}, 200

@app.route("/rooms", methods=["GET"])
def get_rooms():
    rooms = Rooms.query.all()
    return jsonify([r.to_dict() for r in rooms])

@app.route("/rooms", methods=["POST"])
def create_room():
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
    return jsonify(room.to_dict()), 201

@app.route("/rooms/<int:id>", methods=["PATCH"])
def update_room(id):
    room = Rooms.query.get_or_404(id)
    data = request.get_json()
    if "is_available" in data:
        room.is_available = data["is_available"]
    db.session.commit()
    return jsonify(room.to_dict())

@app.route("/rooms/<int:id>", methods=["DELETE"])
def delete_room(id):
    room = Rooms.query.get_or_404(id)
    db.session.delete(room)
    db.session.commit()
    return {"message": f"Room {id} deleted"}, 200

@app.route("/bookings", methods=["GET"])
def get_bookings():
    bookings = Bookings.query.all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()
    booking = Bookings(
        guest_id=data.get("guest_id"),
        room_id=data.get("room_id"),
        check_in=data.get("check_in"),
        check_out=data.get("check_out"),
        status=data.get("status", "pending"),
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@app.route("/bookings/<int:id>", methods=["PATCH"])
def update_booking(id):
    booking = Bookings.query.get_or_404(id)
    data = request.get_json()
    if "status" in data:
        booking.status = data["status"]
    db.session.commit()
    return jsonify(booking.to_dict())

@app.route("/bookings/<int:id>", methods=["DELETE"])
def delete_booking(id):
    booking = Bookings.query.get_or_404(id)
    db.session.delete(booking)
    db.session.commit()
    return {"message": f"Booking {id} deleted"}, 200
@app.route("/reservations", methods=["GET"])
def get_reservations():
    reserved = Bookings.query.filter(
        Bookings.status.in_(["reserved", "confirmed"])
    ).all()
    return jsonify([r.to_dict() for r in reserved])

if __name__ == '__main__':
    app.run(port=5555, debug=True)
