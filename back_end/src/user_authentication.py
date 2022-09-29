import hashlib, uuid
import random
#from database_models import database
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


if __name__ == '__main__':
    salt = generate_salt()
    print(create_hash('abcdefghijklm', salt))
