#!/usr/bin/env python3

from random import randint, choice as rc
from faker import Faker

from app import app
from config import db, timedelta
from models import (
    Guests,
    Admins,
    Hotels,
    Rooms,
    RoomTypes,
    Bookings,
    BookedRoom,
    Amenities,
    HotelAmenities,
    datetime,
)

fake = Faker()

if __name__ == "__main__":
    with app.app_context():
        print("🚿 Clearing old data...")

        # Delete in dependency order
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
        print("Old data cleared.")

        print("Starting fresh seed...")

        # Guests
        guests = [
            Guests(
                name=fake.name(),
                email=fake.unique.email(),
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
                name=fake.unique.name(),
                _password_hash="password123",
            )
            for _ in range(10)
        ]
        db.session.add_all(admins)
        db.session.commit()
        print("Seeded Admins")

       # Hotels
        hotels = []
        used_emails = set()
        used_names = set()
        used_addresses = set()
        used_phones = set()

        for admin in admins:
            name = fake.unique.company()
            email = fake.unique.email()
            address = fake.unique.address()
            phone = fake.unique.msisdn()

            hotel = Hotels(
                name=name,
                address=address,
                city=fake.city(),
                country=fake.country(),
                email=email,
                phone=phone,
                admin=admin,
            )

            hotels.append(hotel)

        db.session.add_all(hotels)
        db.session.commit()

        print("Seeded Hotels")

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
            hotel = rc(hotels)
            room_type = rc(room_types)
            total_rooms = randint(3, 15)
            available_rooms = randint(0, total_rooms)
            room = Rooms(
                hotel=hotel,
                room_type=room_type,
                room_name=f"Room-{randint(100, 999)}",
                price_per_night=fake.pyfloat(
                    left_digits=5, right_digits=2, min_value=5000, max_value=80000
                ),
                is_available=available_rooms > 0,
                total_rooms=total_rooms,
                available_rooms=available_rooms,
                max_per_booking=randint(1, min(3, total_rooms)),
            )
            rooms.append(room)

        db.session.add_all(rooms)
        db.session.commit()
        print("Seeded Rooms)")

        # Amenities
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

        amenities = []
        for amenity_name in amenities_list:
            amenity = Amenities(
                name=amenity_name,
                description=fake.sentence(),
            )
            amenities.append(amenity)

        db.session.add_all(amenities)
        db.session.commit()
        print("Seeded unique Amenities")

        hotel_amenities = []
        for hotel in hotels:
            selected_amenities = fake.random_elements(
                elements=amenities,
                length=randint(3, 6),
                unique=True
            )
            for amenity in selected_amenities:
                ha = HotelAmenities(hotel_id=hotel.id, amenity_id=amenity.id)
                hotel_amenities.append(ha)

        db.session.add_all(hotel_amenities)
        db.session.commit()
        print("Seeded Hotel Amenities (unique per hotel)")


        # Bookings
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
        print("Seeded Bookings (linked to Guests)")

        # Booked Rooms
        booked_rooms = []
        for booking in bookings:
            selected_rooms = fake.random_elements(elements=rooms, length=randint(1, 3), unique=True)
            for room in selected_rooms:
                booked_rooms.append(BookedRoom(booking_id=booking.id, room_id=room.id))

        db.session.add_all(booked_rooms)
        db.session.commit()
        print("Seeded Booked Rooms")

        print(" All data seeded successfully!\n")
