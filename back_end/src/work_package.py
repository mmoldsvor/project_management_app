from graph import Graph
from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class WorkPackageSchema(Schema):
    resources = fields.Int()
    duration = fields.Int()


class RelationSchema(Schema):
    source = fields.Str(required=True)
    target = fields.Str(required=True)
    relation = fields.Str(required=True, validate=validate.OneOf(('FS', 'FF', 'SS', 'SF')))
    duration = fields.Int(default=0)


class ResourceLoadingSchema(Schema):
    work_packages = fields.Dict(required=True, keys=fields.Str(), values=fields.Nested(WorkPackageSchema))
    relations = fields.List(fields.Nested(RelationSchema), required=True)

    @validates_schema
    def validate_relations(self, data, **kwargs):
        for relation in data['relations']:
            if relation['source'] not in data['work_packages'] or relation['target'] not in data['work_packages']:
                raise ValidationError('RelationSchema between undefined work packages')


class WorkPackage:
    def __init__(self, work_name, resources, duration):
        self.work_name = work_name
        self.resources = resources
        self.duration = duration

        self.early_start = None
        self.late_start = None
        self.early_finish = None
        self.late_finish = None

    @property
    def float(self):
        return self.early_finish - self.late_finish


def search_forward(graph):
    for start_node in graph.start_nodes:
        start_node.early_start = 0
        start_node.early_finish = start_node.duration
        for source, target, edge in graph.search(start_node):
            relation, duration = edge

            match relation:
                case 'FS':
                    if target.early_start is None or source.early_finish + duration > target.early_start:
                        target.early_start = source.early_finish + duration
                        target.early_finish = target.early_start + target.duration
                        print(f'FORWARD: {target.work_name}: {target.early_start} -> {target.early_finish}')


def search_backward(graph):
    for end_node in graph.end_nodes:
        end_node.late_finish = end_node.early_finish
        end_node.late_start = end_node.late_finish - end_node.duration
        for source, target, edge in graph.search(end_node, True):
            relation, duration = edge

            match relation:
                case 'FS':
                    if target.late_finish is None or source.late_start - duration < target.late_finish:
                        target.late_finish = source.late_start - duration
                        target.late_start = target.late_finish - target.duration
                        print(f'BACKWARD: {target.work_name}: {target.late_finish} -> {target.late_start}')


def critical_path(graph):
    critical_path = []
    for start_node in graph.start_nodes:
        if start_node.float == 0:
            critical_path.append(start_node)
            for _, target, _ in graph.search(start_node):
                if target.float == 0:
                    critical_path.append(target)
    return critical_path


if __name__ == '__main__':
    a = WorkPackage('a', 1, 2)
    b = WorkPackage('b', 3, 4)
    c = WorkPackage('c', 5, 6)
    d = WorkPackage('d', 7, 8)
    e = WorkPackage('e', 9, 10)

    graph = Graph()
    
    graph.add_edge(b, a, ('FS', 1))
    graph.add_edge(b, d, ('FS', 2))
    graph.add_edge(a, c, ('FS', 3))
    graph.add_edge(d, c, ('FS', 4))
    graph.add_edge(e, d, ('FS', 5))

    search_forward(graph)
    search_backward(graph)

    print('Critical path:')
    print(' -> '.join([node.work_name for node in critical_path(graph)]))

