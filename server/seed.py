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
    datetime, 
    timedelta
)

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():

        Guests.query.delete()
        HotelAmenities.query.delete()
        Hotels.query.delete()
        Admins.query.delete()
        Bookings.query.delete()
        Amenities.query.delete()
        Rooms.query.delete()
        RoomTypes.query.delete()

        print("Starting seed...")

    # Seed code goes here!

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
        guests =[]
        for n in range(25):

            guest = Guests(
                name = fake.name(),
                email = fake.email(),
                _password_hash = "password123"
            )
            guests.append(guest)

        print("Seeded Guests data")


    # HotelAmenities
        hotel_amenities = []
        for n in range (20):
        
            ha = HotelAmenities(
                hotel_id = fake.random_int(min=1, max=20),
                amenity_id = fake.random_int(min=1, max=20)
            )
            hotel_amenities.append(ha)

        print("Seeded hotel_amenities data")


    # Hotels
        hotels = []
        for n in range(20):

            h = Hotels(
                name = fake.name(),
                address = fake.address(),
                city =fake.city(),
                country = fake.country(),
                email = fake.email(),
                phone = '0738495392'
            )

            hotels.append(h)
        print("Seeded hotels data")


    # Admins
        admins = []
        for n in range(15):

            a = Admins(
                name = fake.name(),
                hotel_id = fake.random_int(min=1, max=20),
                _password_hash = "password123"
            )
            admins.append(a)

        print("Seeded admins data")


    # Bookings
        bookings = []
        for n in range(20):

            b = Bookings(
                guest_id = fake.random_int(min=1, max=20),
                room_id = fake.random_int(min=1, max=20),
                check_in_date = check_in_date,
                check_out_date = check_out_date,
                status = rc(['Reserved', 'Pending', 'No Reservation'])
            )
            bookings.append(b)

        print("Seeded bookings data")

        
    # Amenities
        amenities = []
        for n in range(10):

            amenity = Amenities(
                name = rc(amenities_list),
                description = fake.sentence(),
            )

            amenities.append(amenity)
        print("Seeded amenities data")


    # Rooms
        rooms = []
        for n in range(30):
            r = Rooms(
                hotel_id = randint(1, 20),
                room_type_id = randint(1, 5),
                room_name = f"Room-{randint(100, 999)}",
                price_per_night = fake.pyfloat(left_digits=6, right_digits=2, min_value=5000, max_value=80000),
                is_available = fake.pybool()
            )

            rooms.append(r)
        print("Seeded rooms data")


    # RoomTypes
        room_types = []
        for n in range(5):
            rt = RoomTypes(
                type_name = rc(room_types_list),
                description = fake.sentence()
            )

            room_types.append(rt)
        print("Seeded room types data")


        db.session.add_all(
            guests + hotel_amenities + hotels + admins + bookings + amenities + rooms + room_types
        )
        db.session.commit()
<<<<<<< HEAD
        print("Data Seeded sucessfully")
    
=======
        print("Data Seeded sucessfully")
>>>>>>> ef674dd (Implement admin interface components:)
