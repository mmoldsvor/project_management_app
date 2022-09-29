import os
import uuid
from peewee import *


database_name = os.getenv('DATABASE_NAME', default='postgres')
database = PostgresqlDatabase(database_name, user='postgres', password='postgres', host='postgres')


class BaseModel(Model):
    class Meta:
        database = database


class TestTable(BaseModel):
    test_field = CharField()


class UserTable(BaseModel):
    uuid = UUIDField(primary_key=True, default=uuid.uuid4)
    email = CharField(unique=True)
    name = CharField()
    salt = CharField()
    hash = CharField()


class WorkPackageTable(BaseModel):
    name = CharField()
    

def create_tables():
    with database:
        database.create_tables([TestTable, UserTable, WorkPackageTable])
