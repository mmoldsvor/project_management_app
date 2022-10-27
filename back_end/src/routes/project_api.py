from auth import auth_required

from flask import request, Blueprint
from peewee import DoesNotExist
from marshmallow import ValidationError
from playhouse.shortcuts import model_to_dict

from schemas import project_input_schema, project_output_schema
from database_models import ProjectTable, ProjectOwnerTable

from utility.auth_utils import has_project_access
from utility.deliverable_utils import get_deliverable_list


project_api = Blueprint('project_api', __name__)


@project_api.route('/api/project', methods=['POST'])
@auth_required
def create_project(jwt_data):
    try:
        data = project_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    project = ProjectTable.create(**data)
    ProjectOwnerTable.create(user_id=jwt_data['uuid'], project_id=project.project_id)
    
    return {'id': str(project.project_id)}, 201


@project_api.route('/api/project/<project_id>', methods=['GET', 'DELETE', 'POST'])
@auth_required
def get_project(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    project_condition = (ProjectTable.project_id == project_id)

    if request.method == 'POST':
        try:
            data = project_input_schema.load(request.get_json())
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        ProjectTable.update(**data).where(project_condition).execute()
        return {'message': 'Project was updated'}, 200

    try:
        project = ProjectTable.get(project_condition)
    except DoesNotExist:
        return {'errors': 'Project was not found'}, 404

    if request.method == 'DELETE':
        project.delete_instance(recursive=True)
        return {'message': 'Project was deleted'}, 200

    deliverables = get_deliverable_list(project.project_id)
    project_dict = model_to_dict(project)
    project_dict['deliverables'] = deliverables
    return {'project': project_output_schema.dump(project_dict)}, 200


@project_api.route('/api/projects', methods=['GET'])
@auth_required
def list_projects(jwt_data):
    project_owner_query = ProjectOwnerTable.select(
        ProjectOwnerTable.project_id
    ).where(ProjectOwnerTable.user_id == jwt_data['uuid'])

    projects = []
    for owned_project in project_owner_query:
        project_query = ProjectTable.select(
            ProjectTable
        ).where(
            ProjectTable.project_id == owned_project.project_id
        )

        for project in project_query:
            deliverables = get_deliverable_list(project.project_id)
            project_dict = model_to_dict(project)
            project_dict['deliverables'] = deliverables
            projects.append(project_output_schema.dump(project_dict))

    return {'projects': projects}, 200
