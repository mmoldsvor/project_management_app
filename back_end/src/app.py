
from flask import Flask, request
from flask_cors import CORS
from marshmallow import ValidationError


from database_models import database
from schemas import test_schema

from auth import auth_required


from routes.auth_api import auth_api
from routes.project_api import project_api
from routes.deliverable_api import deliverable_api
from routes.work_package_api import work_package_api
from routes.graphic_api import graphic_api


app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_api)
app.register_blueprint(project_api)
app.register_blueprint(deliverable_api)
app.register_blueprint(work_package_api)
app.register_blueprint(graphic_api)


@app.before_request
def before_request():
    database.connect()


@app.after_request
def after_request(response):
    database.close()
    return response


@app.route('/', methods=['GET'])
@auth_required
def index(jwt_data):
    return jwt_data
    

@app.route('/data_test', methods=['POST'])
def data_test():
    try:
        data = test_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    result = test_schema.dump(data)

    return result


app.run(host='0.0.0.0')
