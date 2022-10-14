from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from database_models import DeliverableTable, SubdeliverableTable, WorkPackageTable
from schemas import deliverable_output_schema, subdeliverable_output_schema, work_package_output_schema


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
