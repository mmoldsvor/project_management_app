from peewee import DoesNotExist
from database_models import ProjectOwnerTable, DeliverableTable, SubdeliverableTable


def has_project_access(user_id, project_id):
    try:
        ProjectOwnerTable.get((ProjectOwnerTable.user_id == user_id) & (ProjectOwnerTable.project_id == project_id))    
    except DoesNotExist:
        return False
    return True
