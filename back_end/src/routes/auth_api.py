from flask import request, Blueprint
from marshmallow import ValidationError
from peewee import IntegrityError, DoesNotExist

from auth import account_creation_schema, authentication_schema, generate_salt, encrypt_password, generate_jwt
from database_models import UserTable


auth_api = Blueprint('auth_api', __name__)


@auth_api.route('/create_account', methods=['POST'])
def create_account():
    try:
        data = account_creation_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422
    
    salt = generate_salt()
    hash = encrypt_password(data['password'], salt)

    try:
        UserTable.insert(email=data['email'], name=data['name'], salt=salt, hash=hash).execute()
    except IntegrityError as err:
        return 'Email already in use', 400

    return 'User created', 200 


@auth_api.route('/authenticate', methods=['POST'])
def authenticate():
    try:
        data = authentication_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    incorrect_login_message = 'Incorrect email or password'
    try:
        user = UserTable.get(UserTable.email == data['email'])
    except DoesNotExist as err:
        return incorrect_login_message, 400

    hash = encrypt_password(data['password'], user.salt)

    if (hash != user.hash):
        return incorrect_login_message, 400 

    token = generate_jwt(data['email'], str(user.user_id))
    
    return token, 200
