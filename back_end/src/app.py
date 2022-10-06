import os

import jwt
from flask import Flask, request
from marshmallow import ValidationError
from functools import wraps

from database_models import database, TestTable, UserTable
from peewee import IntegrityError, DoesNotExist
from schemas import test_schema
from work_package import resource_loading_schema, traverse_package_graph
from user_authentication import user_authentication_schema, generate_salt, encrypt_password, generate_jwt
from graph import Graph


# TEMPORARY START
if not 'testtable' in database.get_tables():
    from database_models import create_tables
    create_tables()
# TEMPORARY END


app = Flask(__name__)


@app.before_request
def before_request():
    database.connect()


@app.after_request
def after_request(response):
    database.close()
    return response


def auth_required(func):
    @wraps(func)
    def decorator(*args, **kwargs):
        if 'Authorization' in request.headers:
            _, token = request.headers['Authorization'].split()

            try:
                jwt_data = jwt.decode(token, 'abcdefghijklmnopqrstuvwxyz', algorithms=['HS256'])
            except Exception as e:
                return str(e), 401
        else:
            return 'Missing a valid token', 401

        return func(jwt_data, *args, **kwargs)
    return decorator


@app.route('/', methods=['GET'])
@auth_required
def index(jwt_data):
    return jwt_data
    

@app.route('/data_test', methods=['POST'])
def data_test():
    input = request.get_json()
    try:
        data = test_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    result = test_schema.dump(data)

    return result


@app.route('/time_schedule', methods=['POST'])
def time_schedule():
    input = request.get_json()
    try:
        data = resource_loading_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    graph = Graph()
    for relation in data['relations']:
        target = data['work_packages'][relation['target']]
        source = data['work_packages'][relation['source']]
        graph.add_edge(source, target, (relation['relation'], relation['duration']))

    traverse_package_graph(graph)
    
    return resource_loading_schema.dump(data) 


@app.route('/create_user', methods=['POST'])
def create_user():
    input = request.get_json()
    try:
        data = user_authentication_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422
    
    salt = generate_salt()
    hash = encrypt_password(data['password'], salt)

    try:
        uuid = UserTable.insert(email=data['email'], name=data['name'], salt=salt, hash=hash).execute()
    except IntegrityError as err:
        return 'Email already in use', 400

    return 'User created', 200 

@app.route('/authenticate', methods=['POST'])
def log_in():
    input = request.get_json()
    try:
        data = user_authentication_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    incorrect_login_message = 'User or password incorrect'
    try:
        user = UserTable.get(UserTable.email == data['email'])
    except DoesNotExist as err:
        return incorrect_login_message, 400

    hash = encrypt_password(data['password'], user.salt)

    if (hash != user.hash):
        return incorrect_login_message, 400 

    jwt_token = generate_jwt(data['email'], str(user.uuid), 3600, 'abcdefghijklmnopqrstuvwxyz')
    
    return jwt_token, 200


port = int(os.getenv('API_PORT', default=5000))
app.run(host='0.0.0.0', port=port)
