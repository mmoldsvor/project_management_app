import json

from flask import request, Blueprint
from marshmallow import ValidationError
from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from auth import auth_required
from schemas import work_package_input_schema, work_package_output_schema, work_package_relation_output_schema, work_package_relation_input_schema
from database_models import database, WorkPackageTable, DeliverableWorkPackageTable, SubdeliverableWorkPackageTable, WorkPackageRelationTable, WorkPackageNodeTable

from utility.auth_utils import has_project_access
from utility.deliverable_utils import work_package_in_project, get_connected_subdeliverable, get_connected_deliverable

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

    with database.atomic() as transaction:
        try:
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
        except:
            transaction.rollback()
            return {'errors': 'Deliverable or subdeliverable does not exist'}

    return {'id': work_package.id}, 200


@work_package_api.route('/project/<project_id>/work_packages/', methods=['GET'])
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
        work_package_dict = model_to_dict(work_package)

        subdeliverable_id = get_connected_subdeliverable(work_package.id)
        if subdeliverable_id is not None:
            work_package_dict['subdeliverable_id'] = subdeliverable_id
        
        deliverable_id = get_connected_deliverable(work_package.id)
        if deliverable_id is not None:
            work_package_dict['deliverable_id'] = deliverable_id 

        work_packages.append(work_package_output_schema.dump(work_package_dict))
    
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
        
        work_package_data = {key: value for key, value in data.items() if key not in ('deliverable_id', 'subdeliverable_id')}
        
        WorkPackageTable.update(
            **work_package_data
        ).where(
            work_package_condition
        ).execute()

        # Update deliverable/subdeliverable table as well

        return {'message': 'Work package was updated'}, 200

    try:
        work_package = WorkPackageTable.get(work_package_condition)
    except DoesNotExist:
        return {'errors': 'Work package not found'}, 404

    if request.method == 'DELETE':
        work_package.delete_instance()
        return {'errors': 'Work package was deleted'}, 200
    
    work_package_dict = model_to_dict(work_package)

    subdeliverable_id = get_connected_subdeliverable(work_package.id)
    if subdeliverable_id is not None:
        work_package_dict['subdeliverable_id'] = subdeliverable_id
    
    deliverable_id = get_connected_deliverable(work_package.id)
    if deliverable_id is not None:
        work_package_dict['deliverable_id'] = deliverable_id 
    
    return {'work_package': work_package_output_schema.dump(work_package_dict)}, 200


@work_package_api.route('/project/<project_id>/relation/', methods=['POST'])
@auth_required
def create_relation(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    try:
        data = work_package_relation_input_schema.load(request.get_json())
    except ValidationError as err:
        return {'errors': err.messages}, 422

    if (not work_package_in_project(data['source_id'], project_id) or
        not work_package_in_project(data['target_id'], project_id)):
        return {'errors': 'Relation not found'}, 404

    relation = WorkPackageRelationTable.create(
        **data,
        project=project_id
    )
    
    return {'id': str(relation.id)}, 200 

@work_package_api.route('/project/<project_id>/relations', methods=['GET', 'DELETE'])
@auth_required
def list_work_package_relations(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    if request.method == 'DELETE':
        WorkPackageRelationTable.delete().where(
            WorkPackageRelationTable.project == project_id
        ).execute()

        return {'message': 'Relations successfully deleted'}, 200
    
    relation_query = WorkPackageRelationTable.select(
        WorkPackageRelationTable
    ).where(
        WorkPackageRelationTable.project == project_id
    )
    
    relations = []
    for relation in relation_query:
        relations.append(work_package_relation_output_schema.dump(relation))
    
    return {'relations': relations}, 200


@work_package_api.route('/project/<project_id>/relation/<relation_id>', methods=['GET', 'DELETE', 'POST'])
@auth_required
def work_package_relation(jwt_data, project_id, relation_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    relation_condition = (
        (WorkPackageRelationTable.project == project_id) & 
        (WorkPackageRelationTable.id == relation_id)
    )

    if request.method == 'POST':
        try:
            data = work_package_relation_input_schema.load(request.get_json())
        except ValidationError as err:
            return {'errors': err.messages}, 422
        
        if (not work_package_in_project(data['source_id'], project_id) or
            not work_package_in_project(data['target_id'], project_id)):
            return {'errors': 'Relation not found'}, 404
        
        WorkPackageRelationTable.update(**data).where(relation_condition).execute()
        return {'message': 'Relation was updated'}, 200

    try:
        relation = WorkPackageRelationTable.get(relation_condition)
    except DoesNotExist:
        return {'errors': 'Relation not found'}, 404

    if request.method == 'DELETE':
        relation.delete_instance()
        return {'errors': 'Relation was deleted'}, 200
    
    return {'relation': work_package_relation_output_schema.dump(model_to_dict(relation))}, 200

@work_package_api.route('/project/<project_id>/nodes', methods=['GET', 'POST'])
@auth_required
def node_information(jwt_data, project_id):
    if not has_project_access(jwt_data['uuid'], project_id):
        return {'errors': 'You do not have access to this project'}, 401

    
    if request.method == 'POST':
        data = request.get_json()
        try:
            value = WorkPackageNodeTable.get(project=project_id)
                        
            WorkPackageNodeTable.update(
                node=json.dumps(data)
            ).where(
                WorkPackageNodeTable.project==project_id
            ).execute()
            return {'message': 'Node update was successful'}, 200
        except DoesNotExist:
            WorkPackageNodeTable.create(
                node=json.dumps(data),
                project=project_id
            )
            return {'message': 'Node creation was successful'}, 200
    else:
        try:
            value = WorkPackageNodeTable.get(project=project_id)
            
            return json.loads(value.node), 200
        except DoesNotExist:
            return {'errors': 'Node does not exist'}, 404

