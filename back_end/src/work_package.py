from collections import defaultdict
from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class WorkPackage(Schema):
    resources = fields.Int()
    duration = fields.Int()


class Relation(Schema):
    source = fields.Str(required=True)
    target = fields.Str(required=True)
    relation = fields.Str(required=True, validate=validate.OneOf(('FS', 'FF', 'SS', 'SF')))


class ResourceLoading(Schema):
    work_packages = fields.Dict(required=True, keys=fields.Str(), values=fields.Nested(WorkPackage))
    relations = fields.List(fields.Nested(Relation), required=True)

    @validates_schema
    def validate_relations(self, data, **kwargs):
        for relation in data['relations']:
            if relation['source'] not in data['work_packages'] or relation['target'] not in data['work_packages']:
                raise ValidationError('Relation between undefined work packages')


class Graph:
    def __init__(self):
        self.graph = defaultdict(list)

    def add_edge(self, source, target):
        self.graph[source].append(target)        

    def search(self, node):
        visited = [node]
        queue = [node]

        while queue:
            node = queue.pop(0)
            print(node.work_name)

            for neighbor in self.graph[node]:
                if neighbor not in visited:
                    visited.append(neighbor)
                    queue.append(neighbor)


class Node:
    def __init__(self, work_name, resources, duration):
        self.work_name = work_name
        self.resources = resources
        self.duration = duration

        self.early_start = None
        self.late_start = None
        self.early_finish = None
        self.late_finish = None

