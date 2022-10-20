import os
import uuid
from peewee import *


database_name = os.getenv('DATABASE_NAME', default='postgres')
database = PostgresqlDatabase(database_name, user='postgres', password='postgres', host='postgres')


class BaseModel(Model):
    class Meta:
        database = database


class UserTable(BaseModel):
    user_id = UUIDField(primary_key=True, default=uuid.uuid4)
    email = CharField(unique=True)
    name = CharField()
    salt = CharField()
    hash = CharField()


class ProjectTable(BaseModel):
    project_id = UUIDField(primary_key=True, default=uuid.uuid4)
    name = CharField()
    project_type = CharField()
    description = CharField()


class ProjectOwnerTable(BaseModel):
    user = ForeignKeyField(UserTable)
    project = ForeignKeyField(ProjectTable)


class DeliverableTable(BaseModel):
    name = CharField()
    description = CharField()

    project = ForeignKeyField(ProjectTable)


class SubdeliverableTable(BaseModel):
    name = CharField()
    description = CharField()

    deliverable = ForeignKeyField(DeliverableTable)


class WorkPackageTable(BaseModel):
    name = CharField()
    description = CharField()
    duration = IntegerField()
    resources = IntegerField()

    project = ForeignKeyField(ProjectTable)


class SubdeliverableWorkPackageTable(BaseModel):
    subdeliverable = ForeignKeyField(SubdeliverableTable)
    work_package = ForeignKeyField(WorkPackageTable)

    
class DeliverableWorkPackageTable(BaseModel):
    deliverable = ForeignKeyField(DeliverableTable)
    work_package = ForeignKeyField(WorkPackageTable)

class WorkPackageRelationTable(BaseModel):
    source = ForeignKeyField(WorkPackageTable)
    target = ForeignKeyField(WorkPackageTable)
    relation = CharField()
    duration = IntegerField()


def create_tables():
    with database:
        database.create_tables([
            UserTable,
            ProjectTable,
            ProjectOwnerTable,
            DeliverableTable,
            SubdeliverableTable,
            WorkPackageTable,
            SubdeliverableWorkPackageTable,
            DeliverableWorkPackageTable,
            WorkPackageRelationTable
        ])

def drop_tables():
    with database:
        database.drop_tables([
            UserTable,
            ProjectTable,
            ProjectOwnerTable,
            DeliverableTable,
            SubdeliverableTable,
            WorkPackageTable,
            SubdeliverableWorkPackageTable,
            DeliverableWorkPackageTable,
            WorkPackageRelationTable
        ],
        cascade=True)
