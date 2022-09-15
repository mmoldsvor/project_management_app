import os
from peewee import *


database_name = os.getenv('DATABASE_NAME', default='testing_db')
database = PostgresqlDatabase(database_name, user='postgres', password='postgres', host='postgres')


class BaseModel(Model):
    class Meta:
        database = database


class TestTable(BaseModel):
    test_field = CharField()


def create_tables():
    with database:
        database.create_tables([TestTable])
