from unittest import skip
from marshmallow import Schema, fields, validate, pre_load, validates_schema, ValidationError


class TestSchema1(Schema):
    test_int = fields.Int(reqired=True, validate=validate.Range(min=0, max=50))
    test_field = fields.Str(required=True, validate=validate.Length(max=15))
    hello = fields.Str()

    @pre_load
    def lowercase(self, data, **kwargs):
        if 'test_field' in data:
            data['test_field'] = data['test_field'].lower().strip()
        return data

class TestSchema(Schema):
    duration = fields.Int(required=True, validate=validate.Range(min=0))
    mapping = fields.Str(required=True, validate=validate.OneOf(['SF', 'SS', 'FS', 'FF']))



test_schema = TestSchema()


class WorkPackageSchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)
    description = fields.Str()
    resources = fields.Int()
    duration = fields.Int()

    deliverable_id = fields.Int()
    subdeliverable_id = fields.Int()

    @validates_schema
    def validate_id(self, data, **kwargs):
        print(data, kwargs)


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
    work_packages = fields.List(fields.Nested(WorkPackageSchema))


class ProjectSchema(Schema):
    project_id = fields.UUID(required=True)
    name = fields.Str(required=True)
    project_type = fields.Str(missing='')
    description = fields.Str(missing='')

    deliverables = fields.List(fields.Nested(DeliverableSchema))

class WorkPackageRelationSchema(Schema):
    id = fields.Int()
    source_id = fields.Int(required=True, data_key='source')
    target_id = fields.Int(required=True, data_key='target')
    relation = fields.Str(required=True, validate=validate.OneOf(('FS', 'FF', 'SS', 'SF')))
    duration = fields.Int(missing=0)

    @validates_schema(skip_on_field_errors=True)
    def unique_relation(self, data, many, partial):
        if data['source_id'] == data['target_id']:
            raise ValidationError(
                'Source and target cannot have the same id'
            )


project_output_schema = ProjectSchema()
project_input_schema = ProjectSchema(exclude=['project_id', 'deliverables'])

deliverable_output_schema = DeliverableSchema()
deliverable_input_schema = DeliverableSchema(exclude=['id', 'subdeliverables', 'work_packages'])

subdeliverable_output_schema = SubdeliverableSchema()
subdeliverable_input_schema = SubdeliverableSchema(exclude=['id', 'work_packages'])

work_package_output_schema = WorkPackageSchema()
work_package_input_schema = WorkPackageSchema(exclude=['id'])

work_package_relation_output_schema = WorkPackageRelationSchema()
work_package_relation_input_schema = WorkPackageRelationSchema(exclude=['id'])
