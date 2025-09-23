from flask import request
from flask_restful import Resource

class Hotels(Resource):
    def get(self):
        return {"message": "List of hotels"}

    def post(self):
        data = request.get_json()
        return {"message": "Hotel created", "data": data}, 201

class HotelById(Resource):
    def get(self, id):
        return {"message": f"Hotel {id} details"}

    def put(self, id):
        data = request.get_json()
        return {"message": f"Hotel {id} updated", "data": data}

    def delete(self, id):
        return {"message": f"Hotel {id} deleted"}
