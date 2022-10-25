from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict
from database_models import SubdeliverableWorkPackageTable, DeliverableWorkPackageTable

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


def get_work_package_subdeliverable_list(subdeliverable_id):
    subdeliverable_work_package_query = SubdeliverableWorkPackageTable.select(
        SubdeliverableWorkPackageTable
    ).where(
        SubdeliverableWorkPackageTable.subdeliverable == subdeliverable_id
    )

    work_packages = []
    for work_package_entry in subdeliverable_work_package_query:
        work_packages.append(work_package_output_schema.dump(work_package_entry.work_package))

    return work_packages


def get_work_package_deliverable_list(deliverable_id):
    deliverable_work_package_query = DeliverableWorkPackageTable.select(
        DeliverableWorkPackageTable
    ).where(
        DeliverableWorkPackageTable.deliverable == deliverable_id
    )

    work_packages = []
    for work_package_entry in deliverable_work_package_query:
        work_packages.append(work_package_output_schema.dump(work_package_entry.work_package))

    return work_packages


def get_subdeliverable_list(deliverable_id):
    subdeliverable_query = SubdeliverableTable.select(
        SubdeliverableTable
    ).where(
        SubdeliverableTable.deliverable == deliverable_id
    )

    subdeliverables = []
    for subdeliverable in subdeliverable_query:    
        subdeliverable_dict = model_to_dict(subdeliverable)
        work_packages = get_work_package_subdeliverable_list(subdeliverable.id)
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
        deliverable_dict = model_to_dict(deliverable)

        subdeliverables = get_subdeliverable_list(deliverable.id)
        deliverable_dict['subdeliverables'] = subdeliverables

        work_packages = get_work_package_deliverable_list(deliverable.id)
        deliverable_dict['work_packages'] = work_packages

        deliverables.append(deliverable_output_schema.dump(deliverable_dict))
    
    return deliverables

def work_package_in_project(work_package_id, project_id):
    try:
        WorkPackageTable.get(
            (WorkPackageTable.id == work_package_id) &
            (WorkPackageTable.project == project_id)
        )
    except DoesNotExist:
        return False
    return True


def get_connected_subdeliverable(work_package_id):
    try:
        subdeliverable_connection = SubdeliverableWorkPackageTable.get(
            SubdeliverableWorkPackageTable.work_package == work_package_id
        )

        return str(subdeliverable_connection)
    except DoesNotExist:
        return None


def get_connected_deliverable(work_package_id):
    try:
        deliverable_connection = DeliverableWorkPackageTable.get(
            DeliverableWorkPackageTable.work_package == work_package_id
        )
        
        return str(deliverable_connection)
    except DoesNotExist:
        return None