from flask import request, Blueprint
from marshmallow import ValidationError
from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from auth import auth_required
from database_models import DeliverableTable, SubdeliverableTable
from schemas import deliverable_schema, subdeliverable_schema
from routes.project_api import has_project_access


deliverable_api = Blueprint('deliverable_api', __name__)


def deliverable_exists(project_id, deliverable_id):
    try:
        DeliverableTable.get(
            (DeliverableTable.project_id == project_id) &
            (DeliverableTable.id == deliverable_id)
        )
    except DoesNotExist:
        return False
    return True


def subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
    try:
        SubdeliverableTable.get(
            (SubdeliverableTable.deliverable == deliverable_id) &
            (SubdeliverableTable.id == subdeliverable_id)
        )
    except DoesNotExist:
        return False
    return deliverable_exists(project_id, deliverable_id)


@deliverable_api.route('/project/<project_id>/deliverable', methods=['POST'])
@auth_required
def create_deliverable(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    input = request.get_json()
    try:
        data = deliverable_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    deliverable = DeliverableTable.create(
        name=data['name'], 
        description=data['description'], 
        project_id=project_id
    )
    
    return str(deliverable.id), 200 


@deliverable_api.route('/project/<project_id>/deliverables/list', methods=['GET'])
@auth_required
def list_deliverables(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    deliverable_query = DeliverableTable.select(
        DeliverableTable
    ).where(
        DeliverableTable.project == project_id
    )

    deliverables = []
    for deliverable in deliverable_query:
        deliverables.append(deliverable_schema.dump(deliverable))
    
    return deliverables, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_deliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    deliverable = DeliverableTable.get(
        (DeliverableTable.project == project_id) &
        (DeliverableTable.id == deliverable_id)
    )

    return deliverable_schema.dump(model_to_dict(deliverable)), 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable', methods=['POST'])
@auth_required
def create_subdeliverable(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    input = request.get_json()
    try:
        data = subdeliverable_schema.load(input)
    except ValidationError as err:
        return {'errors': err.messages}, 422

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 400 # Check return code
    
    subdeliverable = SubdeliverableTable.create(
        name=data['name'], 
        description=data['description'], 
        deliverable=deliverable_id
    )

    return str(subdeliverable.id), 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverables/list', methods=['GET'])
@auth_required
def list_subdeliverables(jwt_data, project_id, deliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 400 # Check return code

    subdeliverable_query = SubdeliverableTable.select(
        SubdeliverableTable
    ).where(
        (SubdeliverableTable.deliverable == deliverable_id)
    )

    subdeliverables = []
    for subdeliverable in subdeliverable_query:
        subdeliverables.append(deliverable_schema.dump(subdeliverable))
    
    return subdeliverables, 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_subdeliverable(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not deliverable_exists(project_id, deliverable_id):
        return 'Deliverable does not exist', 400 # Check return code
    
    subdeliverable = SubdeliverableTable.get(
        (SubdeliverableTable.deliverable == deliverable_id) &
        (SubdeliverableTable.id == subdeliverable_id)
    )

    return subdeliverable_schema.dump(model_to_dict(subdeliverable)), 200


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package', methods=['POST'])
@auth_required
def create_work_package(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401
    
    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 400 # Check return code


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_packages/list', methods=['GET'])
@auth_required
def list_work_packages(jwt_data, project_id, deliverable_id, subdeliverable_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 400 # Check return code


@deliverable_api.route('/project/<project_id>/deliverable/<deliverable_id>/subdeliverable/<subdeliverable_id>/work_package/<work_package_id>', methods=['GET', 'DELETE'])
@auth_required
def get_or_delete_work_package(jwt_data, project_id, deliverable_id, subdeliverable_id, work_package_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return 'You do not have access to this project', 401

    if not subdeliverable_exists(project_id, deliverable_id, subdeliverable_id):
        return 'Subdeliverable does not exist', 400 # Check return code
