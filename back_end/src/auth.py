import jwt
import hashlib, uuid

from flask import request
from marshmallow import Schema, fields
from functools import wraps
from datetime import datetime, timezone, timedelta

from configuration import config


token_secret = config['JWT']['secret']
token_duration = int(config['JWT']['duration'])
token_algorithm = config['JWT']['algorithm']


def auth_required(func):
    @wraps(func)
    def decorator(*args, **kwargs):
        if 'Authorization' in request.headers:
            _, token = request.headers['Authorization'].split()

            try:
                jwt_data = jwt.decode(token, token_secret, algorithms=[token_algorithm])
            except Exception as e:
                return str(e), 401
        else:
            return 'Missing a valid token', 401

        return func(jwt_data, *args, **kwargs)
    return decorator


class UserAuthenticationSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)


account_creation_schema = UserAuthenticationSchema()
authentication_schema = UserAuthenticationSchema(exclude=['name'])


def generate_salt():
    return uuid.uuid4().hex


def encrypt_password(password, salt=''):
    salted_password = f'{salt}{password}'
    hash = hashlib.sha256(salted_password.encode()).hexdigest()
    return hash


def generate_jwt(email, uuid):
    current_timestamp = datetime.now(tz=timezone.utc)
    expiration_timestamp = current_timestamp + timedelta(seconds=token_duration)
    payload = {
        'sub': email,
        'uuid': uuid,
        'auth_time': int(current_timestamp.timestamp()),
        'exp': int(expiration_timestamp.timestamp()),
        'iat': int(current_timestamp.timestamp()),
    }

    token = jwt.encode(payload, token_secret, algorithm=token_algorithm)
    return str(token)
