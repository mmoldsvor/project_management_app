
from flask import Flask, request
from flask_cors import CORS
from marshmallow import ValidationError


from database_models import database
from schemas import test_schema
from work_package import resource_loading_schema, traverse_package_graph
from graph import Graph

from auth import auth_required


from routes.auth_api import auth_api
from routes.project_api import project_api
from routes.deliverable_api import deliverable_api


app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_api)
app.register_blueprint(project_api)
app.register_blueprint(deliverable_api)


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


@app.route('/time_schedule', methods=['POST'])
def time_schedule():
    try:
        data = resource_loading_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    graph = Graph()
    for relation in data['relations']:
        target = data['work_packages'][relation['target']]
        source = data['work_packages'][relation['source']]
        graph.add_edge(source, target, (relation['relation'], relation['duration']))

    traverse_package_graph(graph)
    
    return resource_loading_schema.dump(data) 



app.run(host='0.0.0.0')
