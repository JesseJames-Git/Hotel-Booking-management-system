from flask_restful import Resource

class Rooms(Resource):
    def get(self):
        return {"message": "List of rooms"}
