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


class WorkPackageSchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)
    description = fields.Str()
    resources = fields.Int()
    duration = fields.Int()


class SubdeliverableSchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)
    description = fields.Str()

    work_packages = fields.List(fields.Nested(WorkPackageSchema))


class DeliverableSchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)
    description = fields.Str()

    subdeliverables = fields.List(fields.Nested(SubdeliverableSchema))


class ProjectSchema(Schema):
    project_id = fields.UUID()
    name = fields.Str(required=True)
    description = fields.Str()

    deliverables = fields.List(fields.Nested(DeliverableSchema))


project_output_schema = ProjectSchema()
project_input_schema = ProjectSchema(exclude=['project_id', 'deliverables'])

deliverable_output_schema = DeliverableSchema()
deliverable_input_schema = DeliverableSchema(exclude=['id', 'subdeliverables'])

subdeliverable_output_schema = SubdeliverableSchema()
subdeliverable_input_schema = SubdeliverableSchema(exclude=['id', 'work_packages'])

work_package_output_schema = WorkPackageSchema()
work_package_input_schema = WorkPackageSchema(exclude=['id'])
