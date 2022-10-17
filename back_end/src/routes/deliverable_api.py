from flask import request, Blueprint
from marshmallow import ValidationError
from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from auth import auth_required
from database_models import DeliverableTable, SubdeliverableTable, WorkPackageTable
from schemas import deliverable_input_schema, deliverable_output_schema, subdeliverable_input_schema, subdeliverable_output_schema, work_package_input_schema, work_package_output_schema

from utility.auth_utils import has_project_access
from utility.deliverable_utils import get_deliverable_list, get_subdeliverable_list, get_work_package_list, deliverable_exists, subdeliverable_exists

deliverable_api = Blueprint('deliverable_api', __name__)


@deliverable_api.route('/project/<project_id>/deliverable', methods=['POST'])
@auth_required
def create_deliverable(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    try:
        data = deliverable_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    deliverable = DeliverableTable.create(
        **data,
        project_id=project_id
    )
    
    return {'id': str(deliverable.id)}, 200 


@deliverable_api.route('/project/<project_id>/deliverables', methods=['GET'])
@auth_required
def list_deliverables(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    deliverables = get_deliverable_list(project_id)
    
    return {'deliverables': deliverables}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_deliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    deliverable_condition = (
        (DeliverableTable.project == project_id) &
        (DeliverableTable.id == deliverable_id)
    )

    if request.method == 'PUT':
        try:
            data = deliverable_input_schema.load(request.get_json())
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        DeliverableTable.update(**data).where(deliverable_condition).execute()
        return {'message': 'Deliverable was updated'}, 200

    try:
        deliverable = DeliverableTable.get(deliverable_condition)
    except DoesNotExist:
        return {'errors': 'Deliverable not found'}, 404

    if request.method == 'DELETE':
        deliverable.delete_instance(recursive=True)
        return {'message': 'Deliverable was deleted'}, 200

    subdeliverables = get_subdeliverable_list(deliverable.id)
    deliverable_dict = model_to_dict(deliverable)
    deliverable_dict['subdeliverables'] = subdeliverables
    return {'deliverable': deliverable_output_schema.dump(deliverable_dict)}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable', methods=['POST'])
@auth_required
def create_subdeliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if not deliverable_exists(project_id, deliverable_id):
        return {'errors': 'Deliverable not found'}, 404

    try:
        data = subdeliverable_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422
    
    subdeliverable = SubdeliverableTable.create(
        **data,
        deliverable=deliverable_id
    )

    return {'id': str(subdeliverable.id)}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverables', methods=['GET'])
@auth_required
def list_subdeliverables(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if not deliverable_exists(project_id, deliverable_id):
        return {'errors': 'Deliverable not found'}, 404

    subdeliverables = get_subdeliverable_list(deliverable_id)
    
    return {'subdeliverables': subdeliverables}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_subdeliverable(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if not deliverable_exists(project_id, deliverable_id):
        return {'errors': 'Deliverable not found'}, 404
    
    subdeliverable_condition = (
        (SubdeliverableTable.deliverable == deliverable_id) &
        (SubdeliverableTable.id == subdeliverable_id)
    )

    if request.method == 'PUT':
        try:
            data = subdeliverable_input_schema.load(request.get_json())
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        SubdeliverableTable.update(**data).where(subdeliverable_condition).execute()
        return {'message': 'Subdeliverable was updated'}, 200

    try:
        subdeliverable = SubdeliverableTable.get(subdeliverable_condition)
    except DoesNotExist:
        return {'errors': 'Subdeliverable not found'}, 404
    
    if request.method == 'DELETE':
        subdeliverable.delete_instance(recursive=True)
        return {'message': 'Subdeliverable was deleted'}, 200

    work_packages = get_work_package_list(subdeliverable.id)
    subdeliverable_dict = model_to_dict(work_packages)
    subdeliverable_dict['work_packages'] = work_packages
    return {'subdeliverable': subdeliverable_output_schema.dump(model_to_dict(subdeliverable_dict))}, 200
    
    

@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package', methods=['POST'])
@auth_required
def create_work_package(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401
    
    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return {'errors': 'Subdeliverable not found'}, 404

    try:
        data = work_package_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    
    work_package = WorkPackageTable.create(
        **data,
        subdeliverable=subdeliverable_id
    )

    return {'id': str(work_package.id)}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_packages', methods=['GET'])
@auth_required
def list_work_packages(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return {'errors': 'Subdeliverable not found'}, 404

    work_packages = get_work_package_list(subdeliverable_id)
    
    return {'work_packages': work_packages}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package/<work_package_id>', methods=['GET', 'DELETE', 'PUT'])
@auth_required
def work_package(jwt_data, project_id, deliverable_id, subdeliverable_id, work_package_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return {'errors': 'Subdeliverable not found'}, 404

    work_package_condition = (
        (WorkPackageTable.subdeliverable == subdeliverable_id) & 
        (WorkPackageTable.id == work_package_id)
    )

    if request.method == 'PUT':
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
