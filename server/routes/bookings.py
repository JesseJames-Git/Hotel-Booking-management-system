from flask_restful import Resource

class Bookings(Resource):
    def get(self):
        return {"message": "List of bookings"}
