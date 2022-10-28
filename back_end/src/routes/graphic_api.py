from flask import request, Blueprint
from marshmallow import ValidationError

from database_models import WorkPackageTable, WorkPackageRelationTable
from work_package import relations_schema, traverse_package_graph, WorkPackage
from render import work_package_graph
from graph import Graph, LoopError
from auth import auth_required
from schemas import work_package_relation_output_schema

from utility.auth_utils import has_project_access


graphic_api = Blueprint('graphic_api', __name__)


@graphic_api.route('/project/<project_id>/time_schedule', methods=['POST'])
@auth_required
def time_schedule(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    work_package_query = WorkPackageTable.select(
        WorkPackageTable
    ).where(
        WorkPackageTable.project == project_id
    )

    work_package_dict = {}
    for work_package in work_package_query:
        work_package_dict[work_package.id] = WorkPackage(
            name=work_package.name,
            resources=work_package.resources,
            duration=work_package.duration
        )

    relation_query = WorkPackageRelationTable.select(
        WorkPackageRelationTable
    ).where(
        WorkPackageRelationTable.project == project_id
    )

    relations = []
    for relation in relation_query:
        relations.append(work_package_relation_output_schema.dump(relation))
    
    graph = Graph()
    for relation in relations:
        target = work_package_dict[relation['target']]
        source = work_package_dict[relation['source']]
        graph.add_edge(source, target, (relation['relation'], relation['duration']))

    try:
        traverse_package_graph(graph)
    except LoopError:
        return {'errors': 'Graph contains loops'}, 422

    work_package_dates = {}
    for node in graph.nodes:
        work_package_dates[node.name] = {
            'early_start': node.early_start,
            'early_finish': node.early_finish,
            'late_start': node.late_start,
            'late_finish': node.late_finish,
            'float': node.float
        }

    return work_package_dates


@graphic_api.route('/graph_work_package', methods=['POST'])
def graph_test():
    input = request.get_json()
    try:
        data = relations_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    graph = Graph()
    for relation in data['relations']:
        target = data['work_packages'][relation['target']]
        source = data['work_packages'][relation['source']]
        graph.add_edge(source, target, (relation['relation'], relation['duration']))

    traverse_package_graph(graph)
    x,y = work_package_graph(graph)
    
    return '\n'.join([str(x),str(y)])
