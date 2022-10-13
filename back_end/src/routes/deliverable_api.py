from flask import request, Blueprint
from marshmallow import ValidationError
from playhouse.shortcuts import model_to_dict

from auth import auth_required
from database_models import DeliverableTable, SubdeliverableTable, WorkPackageTable
from schemas import deliverable_input_schema, deliverable_output_schema, subdeliverable_input_schema, subdeliverable_output_schema, work_package_input_schema, work_package_output_schema
from utility.auth_util import has_project_access, deliverable_exists, subdeliverable_exists


deliverable_api = Blueprint('deliverable_api', __name__)


def get_work_package_list(subdeliverable_id):
    work_package_query = WorkPackageTable.select(
        WorkPackageTable
    ).where(
        WorkPackageTable.subdeliverable == subdeliverable_id
    )

    work_packages = []
    for work_package in work_package_query:    
        work_packages.append(work_package_output_schema.dump(work_package))

    return work_packages


def get_subdeliverable_list(deliverable_id):
    subdeliverable_query = SubdeliverableTable.select(
        SubdeliverableTable
    ).where(
        SubdeliverableTable.deliverable == deliverable_id
    )

    subdeliverables = []
    for subdeliverable in subdeliverable_query:    
        work_packages = get_work_package_list(subdeliverable.id)
        subdeliverable_dict = model_to_dict(subdeliverable)
        subdeliverable_dict['work_packages'] = work_packages
        subdeliverables.append(subdeliverable_output_schema.dump(subdeliverable_dict))

    return subdeliverables


def get_deliverable_list(project_id):
    deliverable_query = DeliverableTable.select(
        DeliverableTable
    ).where(
        DeliverableTable.project == project_id
    )

    deliverables = []
    for deliverable in deliverable_query:
        subdeliverables = get_subdeliverable_list(deliverable.id)
        deliverable_dict = model_to_dict(deliverable)
        deliverable_dict['subdeliverables'] = subdeliverables
        deliverables.append(deliverable_output_schema.dump(deliverable_dict))
    
    return deliverables


@deliverable_api.route('/project/<project_id>/deliverable', methods=['POST'])
@auth_required
def create_deliverable(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    input = request.get_json()
    try:
        data = deliverable_input_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    deliverable = DeliverableTable.create(
        **data,
        project_id=project_id
    )
    
    return str(deliverable.id), 200 


@deliverable_api.route('/project/<project_id>/deliverables/list', methods=['GET'])
@auth_required
def list_deliverables(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    deliverables = get_deliverable_list(project_id)
    
    return {'deliverables': deliverables}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_deliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    deliverable = DeliverableTable.get(
        (DeliverableTable.project == project_id) &
        (DeliverableTable.id == deliverable_id)
    )

    if request.method == 'GET':
        subdeliverables = get_subdeliverable_list(deliverable.id)
        deliverable_dict = model_to_dict(deliverable)
        deliverable_dict['subdeliverables'] = subdeliverables

        return deliverable_output_schema.dump(deliverable_dict), 200

    elif request.method == 'DELETE':
        return 'Not yet implemented', 403


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable', methods=['POST'])
@auth_required
def create_subdeliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 404

    input = request.get_json()
    try:
        data = subdeliverable_input_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422
    
    subdeliverable = SubdeliverableTable.create(
        **data,
        deliverable=deliverable_id
    )

    return str(subdeliverable.id), 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverables/list', methods=['GET'])
@auth_required
def list_subdeliverables(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 404

    subdeliverables = get_subdeliverable_list(deliverable_id)
    
    return {'subdeliverables': subdeliverables}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_subdeliverable(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 404
    
    subdeliverable = SubdeliverableTable.get(
        (SubdeliverableTable.deliverable == deliverable_id) &
        (SubdeliverableTable.id == subdeliverable_id)
    )

    if request.method == 'GET':
        work_packages = get_work_package_list(subdeliverable.id)
        subdeliverable_dict = model_to_dict(work_packages)
        subdeliverable_dict['work_packages'] = work_packages
        return subdeliverable_output_schema.dump(model_to_dict(subdeliverable_dict)), 200
    
    elif request.method == 'DELETE':
        return 'Not yet implemented', 403


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package', methods=['POST'])
@auth_required
def create_work_package(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401
    
    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 404

    input = request.get_json()
    try:
        data = work_package_input_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    
    work_package = WorkPackageTable.create(
        **data,
        subdeliverable=subdeliverable_id
    )

    return str(work_package.id), 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_packages/list', methods=['GET'])
@auth_required
def list_work_packages(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 404

    work_packages = get_work_package_list(subdeliverable_id)
    
    return {'work_packages': work_packages}, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package/<work_package_id>', methods=['GET', 'DELETE', 'PUT'])
@auth_required
def work_package(jwt_data, project_id, deliverable_id, subdeliverable_id, work_package_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 404

    work_package = WorkPackageTable.get(
        (WorkPackageTable.subdeliverable == subdeliverable_id) &
        (WorkPackageTable.id == work_package_id)
    )

    if request.method == 'POST':    
        return work_package_output_schema.dump(model_to_dict(work_package)), 200

    elif request.method == 'DELETE':
        work_package.delete_instance(recursive=True)
        return 'Work package was deleted', 200

    elif request.method == 'PUT':
        input = request.get_json()
        try:
            data = work_package_input_schema.load(input)
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        WorkPackageTable.update(**data).where(
            (WorkPackageTable.subdeliverable == subdeliverable_id) &
            (WorkPackageTable.id == work_package_id)
        ).execute()
  
        return 'Work package was updated', 200


