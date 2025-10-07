from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from config import db, bcrypt, datetime, event
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import and_


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)


class Guests(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'guests'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    # relationships
    bookings = db.relationship(
        'Bookings',
        back_populates='guest',
        cascade="all, delete-orphan"
    )

    # properties
    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    # serialization rules
    serialize_rules = ('-bookings.guest', '-_password_hash',)


class Hotels(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    address = db.Column(db.String, nullable=False, unique=True)
    city = db.Column(db.String)
    country = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    phone = db.Column(db.String, nullable=False, unique=True)
    admin_id = db.Column(db.Integer,  db.ForeignKey('admins.id'))

    # relationships
    admin = db.relationship('Admins', back_populates='hotel')
    rooms = db.relationship('Rooms', back_populates='hotel',
                            cascade="all, delete-orphan")
    hotel_amenities = db.relationship('HotelAmenities', back_populates='hotel',
                                      cascade="all, delete-orphan")
    bookings = db.relationship(
        "Bookings",
        secondary="booked_rooms",
        primaryjoin="Hotels.id==Rooms.hotel_id",
        secondaryjoin="Bookings.id==BookedRoom.booking_id",
        viewonly=True,
        overlaps="rooms,booked_rooms"
    )

    # serialize_rules
    serialize_rules = ('-admin.hotel', '-rooms.hotel', '-hotel_amenities.hotel','-bookings.rooms.hotel','-bookings.guest.booking',)


class Admins(db.Model, SerializerMixin, TimestampMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True,nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    # relationships
    hotel = db.relationship('Hotels', back_populates='admin', uselist=False,
                            cascade="all, delete-orphan")

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    serialize_rules = ('-hotel.admin', '-_password_hash',)


class Rooms(db.Model, SerializerMixin):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'))
    room_type_id = db.Column(db.Integer, db.ForeignKey('room_types.id'))
    room_name = db.Column(db.String, nullable=False)
    price_per_night = db.Column(db.Numeric(6, 2), nullable=False)
    is_available = db.Column(db.Boolean, default=True)

    # relationships
    hotel = db.relationship('Hotels', back_populates='rooms')
    room_type = db.relationship('RoomTypes', back_populates='rooms')
    booked_rooms = db.relationship('BookedRoom', back_populates='room',
                                   cascade="all, delete-orphan")

    serialize_rules = (
        '-hotel.rooms',
        '-room_type.rooms',
        '-booked_rooms.room',
    )

    # association proxy
    bookings = association_proxy('booked_rooms', 'booking')

    @hybrid_property
    def currently_available(self):
        from datetime import datetime
        now = datetime.utcnow()
        active_booking = any(
            b.check_in_date <= now < b.check_out_date
            for b in self.bookings
        )
        return not active_booking

    @currently_available.expression
    def currently_available(cls):
        from datetime import datetime
        now = datetime.utcnow()
        return ~db.exists().where(
            and_(
                BookedRoom.room_id == cls.id,
                Bookings.id == BookedRoom.booking_id,
                Bookings.check_in_date <= now,
                Bookings.check_out_date > now,
            )
        )


class RoomTypes(db.Model, SerializerMixin):
    __tablename__ = 'room_types'

    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)

    rooms = db.relationship('Rooms', back_populates='room_type',
                            cascade="all, delete-orphan")

    serialize_rules = ('-rooms.room_type',)


class Bookings(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.id'))
    check_in_date = db.Column(db.DateTime, nullable=False)
    check_out_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String, default='Pending') 

    guest = db.relationship('Guests', back_populates='bookings')
    booked_rooms = db.relationship('BookedRoom', back_populates='booking',
                                   cascade="all, delete-orphan")

    rooms = association_proxy('booked_rooms', 'room')

    serialize_rules = (
        '-guest.bookings',
        '-booked_rooms.booking',
    )


class BookedRoom(db.Model, SerializerMixin):
    __tablename__ = 'booked_rooms'

    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), primary_key=True)

    room = db.relationship('Rooms', back_populates='booked_rooms')
    booking = db.relationship('Bookings', back_populates='booked_rooms')

    serialize_rules = ('-room.booked_rooms', '-booking.booked_rooms',)

#--------------------event listeners----------------------

@event.listens_for(BookedRoom, "after_insert")
def mark_room_unavailable(mapper, connection, target):
    connection.execute(
        Rooms.__table__.update()
        .where(Rooms.id == target.room_id)
        .values(is_available=False)
    )



@event.listens_for(BookedRoom, "after_delete")
def mark_room_available(mapper, connection, target):
    connection.execute(
        Rooms.__table__.update()
        .where(Rooms.id == target.room_id)
        .values(is_available=True)
    )



class Amenities(db.Model, SerializerMixin):
    __tablename__ = 'amenities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)

    hotel_amenities = db.relationship('HotelAmenities', back_populates='amenity',
                                      cascade="all, delete-orphan")

    serialize_rules = ('-hotel_amenities.amenity',)


class HotelAmenities(db.Model, SerializerMixin):
    __tablename__ = 'hotel_amenities'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'))
    amenity_id = db.Column(db.Integer, db.ForeignKey('amenities.id'))

    # constraints
    __table_args__ = (
        db.UniqueConstraint('hotel_id', 'amenity_id', name='unique_hotel_amenity'),
    )

    # relationships
    hotel = db.relationship('Hotels', back_populates='hotel_amenities')
    amenity = db.relationship('Amenities', back_populates='hotel_amenities')

    # serialize_rules
    serialize_rules = ('-amenity.hotel_amenities', '-hotel.hotel_amenities',)
