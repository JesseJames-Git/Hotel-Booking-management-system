from flask import request, jsonify
from config import app, db
from models import Hotels, Guests, Rooms, Bookings
from datetime import datetime

# HOTELS
@app.route("/hotels", methods=["GET"])
def get_hotels():
    return jsonify([h.to_dict() for h in Hotels.query.all()])

@app.route("/hotels/<int:id>", methods=["GET"])
def get_hotel(id):
    return jsonify(Hotels.query.get_or_404(id).to_dict())

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

# GUESTS
@app.route("/guests", methods=["GET"])
def get_guests():
    return jsonify([g.to_dict() for g in Guests.query.all()])

@app.route("/guests/<int:id>", methods=["GET"])
def get_guest(id):
    return jsonify(Guests.query.get_or_404(id).to_dict())

@app.route("/guests", methods=["POST"])
def create_guest():
    data = request.get_json()
    guest = Guests(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
    )
    db.session.add(guest)
    db.session.commit()
    return jsonify(guest.to_dict()), 201

@app.route("/guests/<int:id>", methods=["PATCH"])
def update_guest(id):
    guest = Guests.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        if hasattr(guest, key):
            setattr(guest, key, value)
    db.session.commit()
    return jsonify(guest.to_dict())

@app.route("/guests/<int:id>", methods=["DELETE"])
def delete_guest(id):
    guest = Guests.query.get_or_404(id)
    db.session.delete(guest)
    db.session.commit()
    return {"message": f"Guest {id} deleted"}, 200

# ROOMS
@app.route("/rooms", methods=["GET"])
def get_rooms():
    return jsonify([r.to_dict() for r in Rooms.query.all()])

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
    for key, value in data.items():
        if hasattr(room, key):
            setattr(room, key, value)
    db.session.commit()
    return jsonify(room.to_dict())

@app.route("/rooms/<int:id>", methods=["DELETE"])
def delete_room(id):
    room = Rooms.query.get_or_404(id)
    db.session.delete(room)
    db.session.commit()
    return {"message": f"Room {id} deleted"}, 200

# BOOKINGS
@app.route("/bookings", methods=["GET"])
def get_bookings():
    return jsonify([b.to_dict() for b in Bookings.query.all()])

@app.route("/bookings/guest/<int:guest_id>", methods=["GET"])
def get_bookings_by_guest(guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/bookings", methods=["POST"])
def create_booking():
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
    return jsonify(booking.to_dict()), 201

@app.route("/bookings/guest/<int:guest_id>", methods=["PATCH"])
def update_booking_by_guest(guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    data = request.get_json()
    for booking in bookings:
        for key, value in data.items():
            if hasattr(booking, key):
                if key in ["check_in", "check_out"]:
                    setattr(booking, key, datetime.fromisoformat(value))
                else:
                    setattr(booking, key, value)
    db.session.commit()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/bookings/guest/<int:guest_id>", methods=["DELETE"])
def delete_bookings_by_guest(guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    for booking in bookings:
        db.session.delete(booking)
    db.session.commit()
    return {"message": f"Bookings for guest {guest_id} deleted"}, 200

@app.route("/reservations", methods=["GET"])
def get_reservations():
    reserved = Bookings.query.filter(Bookings.status.in_(["reserved", "confirmed"])).all()
    return jsonify([r.to_dict() for r in reserved])

if __name__ == '__main__':
    app.run(port=5555, debug=True)