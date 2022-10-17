from marshmallow import Schema, fields, validate, pre_load


class TestSchema(Schema):
    test_int = fields.Int(reqired=True, validate=validate.Range(min=0, max=50))
    test_field = fields.Str(required=True, validate=validate.Length(max=15))

    @pre_load
    def lowercase(self, data, **kwargs):
        if 'test_field' in data:
            data['test_field'] = data['test_field'].lower().strip()
        return data

test_schema = TestSchema()


class ProjectSchema(Schema):
    project_id = fields.UUID()
    name = fields.Str(required=True)
    description = fields.Str()

project_schema = ProjectSchema()
