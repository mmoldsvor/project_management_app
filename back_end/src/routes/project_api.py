from auth import auth_required

from flask import request, Blueprint
from marshmallow import ValidationError
from playhouse.shortcuts import model_to_dict

from schemas import project_schema
from database_models import ProjectTable, ProjectOwnerTable

from utility.auth_util import has_project_access

from routes.deliverable_api import get_deliverable_list


project_api = Blueprint('project_api', __name__)


@project_api.route('/project', methods=['POST'])
@auth_required
def create_project(jwt_data):
    user_id = jwt_data['uuid']

    input = request.get_json()
    try:
        data = project_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    try:
        project = ProjectTable.create(name=data['name'], description=data['description'])
        ProjectOwnerTable.create(user_id=user_id, project_id=project.project_id)
    except Exception as err:
        return err, 500
    
    return str(project.project_id), 201


@project_api.route('/project/<project_id>', methods=['GET', 'DELETE'])
@auth_required
def get_project(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401
    
    project = ProjectTable.get(ProjectTable.project_id == project_id)

    if request.method == 'GET':
        return project_schema.dump(model_to_dict(project)), 200

    elif request.method == 'DELETE':
        project.delete_instance(recursive=True)
        return 'Project was deleted', 200


@project_api.route('/projects/list', methods=['GET'])
@auth_required
def list_projects(jwt_data):
    user_id = jwt_data['uuid']

    project_owner_query = ProjectOwnerTable.select(
        ProjectOwnerTable.project_id
    ).where(ProjectOwnerTable.user_id == user_id)

    projects = []
    for owned_project in project_owner_query:
        project_query = ProjectTable.select(
            ProjectTable.project_id, 
            ProjectTable.name, 
            ProjectTable.description
        ).where(
            ProjectTable.project_id == owned_project.project_id
        )

        for project in project_query:
            deliverables = get_deliverable_list(project.project_id)
            project_dict = model_to_dict(project)
            project_dict['deliverables'] = deliverables
            projects.append(project_schema.dump(project_dict))


    return projects, 200
