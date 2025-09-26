from flask import request, jsonify
from config import app, db, bcrypt
from models import Guests, Hotels, Rooms, Bookings
from datetime import datetime, timedelta
from functools import wraps

UPDATE_LIMIT_DAYS = 3

# Authorization decorator
def authorize(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.authorization
        if not auth or not auth.username or not auth.password:
            return jsonify({"error": "Unauthorized"}), 401
        guest = Guests.query.filter_by(email=auth.username).first()
        if not guest or not guest.authenticate(auth.password):
            return jsonify({"error": "Unauthorized"}), 401
        return f(guest, *args, **kwargs)
    return wrapper

# GUEST ROUTES
@app.route("/guests", methods=["GET"])
@authorize
def get_guests(current_guest):
    return jsonify([g.to_dict() for g in Guests.query.all()])

@app.route("/guests/<int:id>", methods=["GET"])
@authorize
def get_guest(current_guest, id):
    guest = Guests.query.get_or_404(id)
    return jsonify(guest.to_dict())

@app.route("/guests", methods=["POST"])
def create_guest():
    data = request.get_json()
    guest = Guests(
        name=data.get("name"),
        email=data.get("email"),
        password_hash=data.get("password")
    )
    db.session.add(guest)
    db.session.commit()
    return jsonify(guest.to_dict()), 201

@app.route("/guests/<int:id>", methods=["PATCH"])
@authorize
def update_guest(current_guest, id):
    guest = Guests.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        if hasattr(guest, key):
            setattr(guest, key, value)
    db.session.commit()
    return jsonify(guest.to_dict())

@app.route("/guests/<int:id>", methods=["DELETE"])
@authorize
def delete_guest(current_guest, id):
    guest = Guests.query.get_or_404(id)
    db.session.delete(guest)
    db.session.commit()
    return {"message": f"Guest {id} deleted"}, 200

# HOTELS
@app.route("/hotels", methods=["GET"])
def get_hotels():
    return jsonify([h.to_dict() for h in Hotels.query.all()])

@app.route("/hotels/<int:id>", methods=["GET"])
def get_hotel(id):
    hotel = Hotels.query.get_or_404(id)
    return jsonify(hotel.to_dict())

# BOOKINGS
@app.route("/bookings/guest/<int:guest_id>", methods=["GET"])
@authorize
def get_bookings_by_guest(current_guest, guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/bookings", methods=["POST"])
@authorize
def create_booking(current_guest):
    data = request.get_json()
    check_in = datetime.fromisoformat(data.get("check_in_date"))
    if check_in - timedelta(days=UPDATE_LIMIT_DAYS) < datetime.utcnow():
        return jsonify({"error": "Bookings must be made at least 3 days in advance"}), 403
    booking = Bookings(
        guest_id=current_guest.id,
        room_id=data.get("room_id"),
        check_in_date=check_in,
        check_out_date=datetime.fromisoformat(data.get("check_out_date")),
        status=data.get("status", "No Reservation")
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@app.route("/bookings/guest/<int:guest_id>", methods=["PATCH"])
@authorize
def update_booking_by_guest(current_guest, guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    data = request.get_json()
    for booking in bookings:
        if booking.check_in_date - timedelta(days=UPDATE_LIMIT_DAYS) < datetime.utcnow():
            return jsonify({"error": "Cannot update bookings within 3 days of check-in"}), 403
        for key, value in data.items():
            if hasattr(booking, key):
                if key in ["check_in_date", "check_out_date"]:
                    setattr(booking, key, datetime.fromisoformat(value))
                else:
                    setattr(booking, key, value)
    db.session.commit()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/bookings/guest/<int:guest_id>", methods=["DELETE"])
@authorize
def delete_bookings_by_guest(current_guest, guest_id):
    bookings = Bookings.query.filter_by(guest_id=guest_id).all()
    for booking in bookings:
        if booking.check_in_date - timedelta(days=UPDATE_LIMIT_DAYS) < datetime.utcnow():
            return jsonify({"error": "Cannot delete bookings within 3 days of check-in"}), 403
        db.session.delete(booking)
    db.session.commit()
    return {"message": f"Bookings for guest {guest_id} deleted"}, 200
