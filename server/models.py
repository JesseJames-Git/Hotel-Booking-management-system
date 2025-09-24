from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime, timedelta

from config import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    
 # Models go here!  



class Guests(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'guests'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    # relationships
    bookings = db.relationship('Bookings', back_populates='guest')


class Hotels(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    city = db.Column(db.String)
    country = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)

    # relationships
    admin = db.relationship('Admins', back_populates='hotel', uselist=False)
    rooms = db.relationship('Rooms', back_populates='hotel')
    hotel_amenities = db.relationship('HotelAmenities', back_populates='hotel')

class Admins(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'))

    # relationships
    hotel = db.relationship('Hotels', back_populates='admin')

class Rooms(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'))
    room_type_id = db.Column(db.Integer, db.ForeignKey('room_types.id'))
    price_per_night = db.Column(db.Numeric(6,2), nullable=False)
    is_available = db.Column(db.Boolean)

    # relationships
    hotel = db.relationship('Hotels', back_populates='rooms')
    room_type = db.relationship('RoomType', back_populates='rooms')

class RoomTypes(db.Model, SerializerMixin):
    __tablename__ = 'room_types'

    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String, nullable=False)
    description  = db.Column(db.Text)

    # relationships
    rooms = db.relationship('Rooms', back_populates='room_type')

class Bookings(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.id'))
    room_id = db.Column (db.Integer, db.ForeignKey('rooms.id'))
    check_in_date = db.Column(db.DateTime, nullable=False)
    check_out_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String, default='No Reservation')

    # relationships
    guest = db.relationship('Guests', back_populates='bookings')

class Amenities(db.Model, SerializerMixin):
    __tablename__ = 'amenities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)

    # relationships
    hotel_amenities = db.relationship('HotelAmenities', back_populates='amenity')

class HotelAmenities(db.Model, SerializerMixin):
    __tablename__ = 'hotel_amenities'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id')) 
    amenity_id = db.Column(db.Integer, db.ForeignKey('amenities.id'))

    # relationships
    hotel = db.relationship('Hotel', back_populates='hotel_amenities')
    amenity = db.relationship('Amenities', back_populates='hotel_amenities')