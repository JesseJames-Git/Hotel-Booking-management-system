#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from config import db, timedelta
from models import (
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
)

fake = Faker()

if __name__ == "__main__":
    with app.app_context():
        print("Clearing old data...")

        BookedRoom.query.delete()
        Bookings.query.delete()
        HotelAmenities.query.delete()
        Rooms.query.delete()
        RoomTypes.query.delete()
        Hotels.query.delete()
        Admins.query.delete()
        Amenities.query.delete()
        Guests.query.delete()

        db.session.commit()

        print("Starting fresh seed...")

        # Guests
        guests = [
            Guests(
                name=fake.name(),
                email=fake.email(),
                _password_hash="password123",
            )
            for _ in range(50)
        ]
        db.session.add_all(guests)
        db.session.commit()
        print("Seeded Guests")

        # Admins
        admins = [
            Admins(
                name=fake.name(),
                _password_hash="password123",
            )
            for _ in range(10)
        ]
        db.session.add_all(admins)
        db.session.commit()
        print("Seeded Admins")

        # Hotels
        hotels = []
        for admin in admins:
            hotel = Hotels(
                name=fake.company(),
                address=fake.address(),
                city=fake.city(),
                country=fake.country(),
                email=fake.email(),
                phone=fake.phone_number(),
                admin=admin,
            )
            hotels.append(hotel)

        db.session.add_all(hotels)
        db.session.commit()
        print("Seeded Hotels linked to Admins")

        # Room Types
        room_types_list = [
            "Single Room",
            "Double Room",
            "Twin Room",
            "Suite",
            "Deluxe Room",
        ]
        room_types = [
            RoomTypes(
                type_name=type_name,
                description=fake.sentence(),
            )
            for type_name in room_types_list
        ]
        db.session.add_all(room_types)
        db.session.commit()
        print("Seeded Room Types")

        # Rooms
        rooms = []
        for _ in range(100):
            room = Rooms(
                hotel=rc(hotels),
                room_type=rc(room_types),
                room_name=f"Room-{randint(100, 999)}",
                price_per_night=fake.pyfloat(
                    left_digits=5, right_digits=2, min_value=5000, max_value=80000
                ),
                is_available=fake.pybool(),
            )
            rooms.append(room)

        db.session.add_all(rooms)
        db.session.commit()
        print("Seeded Rooms")

        #  Amenities
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
            "Laundry Service",
        ]
        amenities = [
            Amenities(
                name=amenity,
                description=fake.sentence(),
            )
            for amenity in amenities_list
        ]
        db.session.add_all(amenities)
        db.session.commit()
        print(" Seeded Amenities")

        # Hotel Amenities (linking hotels and amenities)
        hotel_amenities = [
            HotelAmenities(
                hotel=rc(hotels),
                amenity=rc(amenities),
            )
            for _ in range(50)
        ]
        db.session.add_all(hotel_amenities)
        db.session.commit()
        print("Seeded Hotel Amenities")

        #  Bookings (linked to valid Guests and Rooms)
        bookings = []
        for _ in range(40):
            guest = rc(guests)
            check_in_date = fake.date_time_between(start_date="-6m", end_date="now")
            check_out_date = check_in_date + timedelta(days=fake.random_int(min=1, max=10))

            booking = Bookings(
                guest_id=guest.id,
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                status=rc(["Confirmed", "Pending", "Denied"]),
            )
            bookings.append(booking)

        db.session.add_all(bookings)
        db.session.commit()
        print("Seeded Bookings linked to Guests")

        # Booked Rooms (link bookings to hotel rooms)
        booked_rooms = []
        for booking in bookings:
            for room in fake.random_elements(elements=rooms, length=randint(1, 3), unique=True):
                booked_rooms.append(BookedRoom(booking_id=booking.id, room_id=room.id))

        db.session.add_all(booked_rooms)
        db.session.commit()
        print(" Seeded Booked Rooms")

        print(" All data seeded successfully!")
