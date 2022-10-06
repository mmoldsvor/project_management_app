import hashlib, uuid
import jwt
import random
#from database_models import database
from datetime import datetime, timezone, timedelta
from marshmallow import Schema, fields, validate, ValidationError


class UserAuthenticationSchema(Schema):
    name = fields.Str()
    email = fields.Email(required=True)
    password = fields.Str(required=True)


user_authentication_schema = UserAuthenticationSchema()


def generate_salt():
    return uuid.uuid4().hex


def encrypt_password(password, salt=''):
    salted_password = f'{salt}{password}'
    hash = hashlib.sha256(salted_password.encode()).hexdigest()
    return hash

def generate_jwt(email, uuid, token_duration, secret):
    current_timestamp = datetime.now(tz=timezone.utc)
    expiration_timestamp = current_timestamp + timedelta(seconds=token_duration)
    payload = {
        'sub': email,
        'uuid': uuid,
        'auth_time': int(current_timestamp.timestamp()),
        'exp': int(expiration_timestamp.timestamp()),
        'iat': int(current_timestamp.timestamp()),
    }

    jwt_token = jwt.encode(payload, secret, algorithm='HS256')
    return str(jwt_token)


if __name__ == '__main__':
    salt = generate_salt()
    print(create_hash('abcdefghijklm', salt))
