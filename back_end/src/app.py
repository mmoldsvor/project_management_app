import os

from flask import Flask, request
from marshmallow import ValidationError

from database_models import database, TestTable
from schemas import test_schema


# TEMPORARY START
if not 'testtable' in database.get_tables():
    from database_models import create_tables
    create_tables()
# TEMPORARY END


app = Flask(__name__)


@app.before_request
def before_request():
    database.connect()


@app.after_request
def after_request(response):
    database.close()
    return response


@app.route('/')
def index():
    results = TestTable.select(TestTable.id, TestTable.test_field).order_by(TestTable.id.desc()).limit(1)

    if len(results) > 0:
        TestTable.create(test_field=f'test {results[0].id}')
        return results[0].test_field

    TestTable.create(test_field='test 0')
    return 'test 0'


@app.route('/data_test', methods=["POST"])
def data_test():
    input = request.get_json()
    try:
        data = test_schema.load(input)
    except ValidationError as err:
        return {"errors": err.messages}, 422

    result = test_schema.dump(data)

    return result


port = int(os.getenv('API_PORT', default=5000))
app.run(host='0.0.0.0', port=port)
