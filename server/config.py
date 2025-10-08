import os

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Standard library imports

# Remote library imports
from flask import Flask, session
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, event
from datetime import datetime, timedelta

# Local imports
from flask_bcrypt import Bcrypt

# Instantiate app, set attributes
app = Flask(
    __name__, 
    static_folder="static", 
    static_url_path="/"     
)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["SESSION_COOKIE_HTTPONLY"] = True


# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
