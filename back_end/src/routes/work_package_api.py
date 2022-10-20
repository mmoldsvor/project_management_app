from flask import request, Blueprint
from marshmallow import ValidationError
from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from auth import auth_required
from schemas import work_package_input_schema, work_package_output_schema, work_package_relation_schema
from database_models import WorkPackageTable, DeliverableWorkPackageTable, SubdeliverableWorkPackageTable, WorkPackageRelationTable

from utility.auth_utils import has_project_access
from utility.deliverable_utils import work_package_in_project

work_package_api = Blueprint('work_package_api', __name__)

@work_package_api.route('/project/<project_id>/work_package', methods=['POST'])
@auth_required
def create_work_package(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    try:
        data = work_package_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    work_package_data = {key: value for key, value in data.items() if key not in ('deliverable_id', 'subdeliverable_id')}
    work_package = WorkPackageTable.create(
        **work_package_data,
        project=project_id
    )

    if 'deliverable_id' in data:
        DeliverableWorkPackageTable.create(
            deliverable=data['deliverable_id'],
            work_package=work_package.id
        )
    elif 'subdeliverable_id' in data:
        SubdeliverableWorkPackageTable.create(
            subdeliverable=data['subdeliverable_id'],
            work_package=work_package.id
        )


    return {'id': work_package.id}, 200


@work_package_api.route('/project/<project_id>/work_packages', methods=['GET'])
@auth_required
def list_work_packages(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    work_package_query = WorkPackageTable.select(
        WorkPackageTable
    ).where(
        WorkPackageTable.project == project_id
    )

    work_packages = []
    for work_package in work_package_query:
        work_packages.append(work_package_output_schema.dump(model_to_dict(work_package)))
    
    return {'work_packages': work_packages}, 200


@work_package_api.route('/project/<project_id>/work_package/<work_package_id>', methods=['GET', 'DELETE', 'POST'])
@auth_required
def work_package(jwt_data, project_id, work_package_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    work_package_condition = (
        (WorkPackageTable.project == project_id) & 
        (WorkPackageTable.id == work_package_id)
    )

    if request.method == 'POST':
        try:
            data = work_package_input_schema.load(request.get_json())
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        WorkPackageTable.update(**data).where(work_package_condition).execute()
        return {'message': 'Work package was updated'}, 200

    try:
        work_package = WorkPackageTable.get(work_package_condition)
    except DoesNotExist:
        return {'errors': 'Work package not found'}, 404

    if request.method == 'DELETE':
        work_package.delete_instance()
        return {'errors': 'Work package was deleted'}, 200
    
    return work_package_output_schema.dump(model_to_dict(work_package)), 200


@work_package_api.route('/project/<project_id>/relation', methods=['POST'])
@auth_required
def create_relation(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    try:
        data = work_package_relation_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    if (not work_package_in_project(data['source_id'], project_id) or
        not work_package_in_project(data['target_id'], project_id)):
        return {'errors': 'Work packages not found'}, 404

    deliverable = WorkPackageRelationTable.create(
        **data
    )
    
    return {'id': str(deliverable.id)}, 200 
