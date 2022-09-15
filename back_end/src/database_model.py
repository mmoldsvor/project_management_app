from peewee import *


db = PostgresqlDatabase('testing_db', user='postgres', password='postgres')

class BaseModel(Model):
    class Meta:
        database = db


class TestTable(BaseModel):
    test_field = CharField()


db.create_tables([TestTable])
