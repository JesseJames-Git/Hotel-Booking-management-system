#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import (
    db,
    Guests, 
    HotelAmenities, 
    Hotels, 
    Admins, 
    Bookings, 
    Amenities, 
    Rooms, 
    RoomTypes, 
    BookedRoom,
    datetime, 
    timedelta
)

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():

        # Clear existing data in correct order
        BookedRoom.query.delete()
        Guests.query.delete()
        HotelAmenities.query.delete()
        Hotels.query.delete()
        Admins.query.delete()
        Bookings.query.delete()
        Amenities.query.delete()
        Rooms.query.delete()
        RoomTypes.query.delete()

        print("Starting seed...")

        check_in_date = fake.date_time_between_dates(
            datetime_start=datetime(2025,1,1),
            datetime_end=datetime.utcnow()
        )
        check_out_date = check_in_date + timedelta(days=fake.random_int(min=1, max=30))

        amenities_list = [
            "Free Wi-Fi",
            "Swimming Pool",
            "Fitness Center",
            "Spa Services",
            "On-site Restaurant",
            "Bar / Lounge",
            "Free Parking",
            "Airport Shuttle",
            "Business Center",
            "Laundry Service"
        ]

        room_types_list = [
            "Single Room",
            "Double Room",
            "Twin Room",
            "Suite",
            "Deluxe Room"
        ]

        # Guests
        guests = [
            Guests(
                name=fake.name(),
                email=fake.email(),
                _password_hash="password123"
            )
            for _ in range(25)
        ]
        print("Seeded Guests data")

        # Hotels
        hotels = [
            Hotels(
                name=fake.company(),
                address=fake.address(),
                city=fake.city(),
                country=fake.country(),
                email=fake.email(),
                phone='0738495392'
            )
            for _ in range(20)
        ]
        print("Seeded hotels data")

        # RoomTypes
        room_types = [
            RoomTypes(
                type_name=rc(room_types_list),
                description=fake.sentence()
            )
            for _ in range(5)
        ]
        print("Seeded room types data")

        # Rooms
        rooms = [
            Rooms(
                hotel_id=randint(1, 20),
                room_type_id=randint(1, 5),
                room_name=f"Room-{randint(100, 999)}",
                price_per_night=fake.pyfloat(left_digits=6, right_digits=2, min_value=5000, max_value=80000),
                is_available=fake.pybool()
            )
            for _ in range(30)
        ]
        print("Seeded rooms data")

        # Admins
        admins = [
            Admins(
                name=fake.name(),
                hotel_id=randint(1, 20),
                _password_hash="password123"
            )
            for _ in range(15)
        ]
        print("Seeded admins data")

        # Amenities
        amenities = [
            Amenities(
                name=rc(amenities_list),
                description=fake.sentence(),
            )
            for _ in range(10)
        ]
        print("Seeded amenities data")

        # HotelAmenities
        hotel_amenities = [
            HotelAmenities(
                hotel_id=randint(1, 20),
                amenity_id=randint(1, 10)
            )
            for _ in range(20)
        ]
        print("Seeded hotel_amenities data")

        # Bookings
        bookings = [
            Bookings(
                guest_id=randint(1, 25),
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                status=rc(['Reserved', 'Pending', 'No Reservation'])
            )
            for _ in range(20)
        ]
        print("Seeded bookings data")

        db.session.add_all(guests + hotels + room_types + rooms + admins + amenities + hotel_amenities + bookings)
        db.session.commit()

        # BookedRoom
        booked_rooms = []
        for booking in bookings:
            for room in fake.random_elements(elements=rooms, length=randint(1, 3), unique=True):
                booked_rooms.append(BookedRoom(booking_id=booking.id, room_id=room.id))

        db.session.add_all(booked_rooms)
        db.session.commit()

        print("Data Seeded successfully")
