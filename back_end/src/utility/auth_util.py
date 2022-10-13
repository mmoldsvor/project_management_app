from peewee import DoesNotExist
from database_models import ProjectOwnerTable, DeliverableTable, SubdeliverableTable


def has_project_access(user_id, project_id):
    try:
        ProjectOwnerTable.get((ProjectOwnerTable.user_id == user_id) & (ProjectOwnerTable.project_id == project_id))    
    except DoesNotExist:
        return False
    return True


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
