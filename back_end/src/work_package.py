from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from schemas import WorkPackageSchema


class RelationSchema(Schema):
    source = fields.Str(required=True)
    target = fields.Str(required=True)
    relation = fields.Str(required=True, validate=validate.OneOf(('FS', 'FF', 'SS', 'SF')))
    duration = fields.Int(default=0)


class ResourceLoadingSchema(Schema):
    work_packages = fields.Dict(keys=fields.Str(), values=fields.Nested(WorkPackageSchema), required=True)
    relations = fields.List(fields.Nested(RelationSchema), required=True)

    @validates_schema
    def validate_relations(self, data, **kwargs):
        for relation in data['relations']:
            if relation['source'] not in data['work_packages'] or relation['target'] not in data['work_packages']:
                raise ValidationError('RelationSchema between undefined work packages')


resource_loading_schema = ResourceLoadingSchema()

class WorkPackage:
    def __init__(self, name, resources, duration, early_start=None, early_finish=None, late_start=None, late_finish=None):
        self.name = name
        self.resources = resources
        self.duration = duration

        self.early_start = early_start
        self.early_finish = early_finish
        self.late_start = late_start
        self.late_finish = late_finish

    def __repr__(self):
        return self.name

    @property
    def float(self):
        if self.early_finish is not None and self.late_finish is not None:
            return self.early_finish - self.late_finish
        return None


def search_forward(graph):
    for start_node in graph.start_nodes:
        print(start_node)
        start_node.early_start = 0
        start_node.early_finish = start_node.duration
        for target, source, edge in graph.search(start_node):
            relation, duration = edge
            print(f'{source} -> {target}', edge)

            match relation:
                case 'FS':
                    if target.early_start is None or source.early_finish + duration > target.early_start:
                        target.early_start = source.early_finish + duration
                        target.early_finish = target.early_start + target.duration

                case 'SS':
                    if target.early_start is None or source.early_start + duration > target.early_start:
                        target.early_start = source.early_start + duration
                        target.early_finish = target.early_start + target.duration

                case 'SF':
                    if target.early_finish is None or source.early_start + duration > target.early_finish:
                        target.early_finish = source.early_start + duration
                        target.early_start = target.early_finish - target.duration

                case 'FF':
                    if target.early_finish is None or source.early_finish + duration > target.early_finish:
                        target.early_finish = source.early_finish + duration
                        target.early_start = target.early_finish - target.duration
            print(f'target: {target.name}, ES: {target.early_start}, EF: {target.early_finish}')


def search_backward(graph):
    early_finish_max= None
    for end_node in graph.end_nodes:
        if early_finish_max is None or end_node.early_finish > early_finish_max:
            early_finish_max = end_node.early_finish


    for end_node in graph.end_nodes:
        print(end_node, end_node.early_finish,  end_node.late_finish, end_node.early_start, end_node.late_start)
        end_node.late_finish = early_finish_max
        end_node.late_start = end_node.late_finish - end_node.duration
        print(end_node.name, end_node.late_start, end_node.late_finish)
        for target, source, edge in graph.search(end_node, True):
            relation, duration = edge

            match relation:
                case 'FS':
                    if target.late_finish is None or source.late_start - duration < target.late_finish:
                        target.late_finish = source.late_start - duration
                        target.late_start = target.late_finish - target.duration

                case 'SS':
                    if target.late_start is None or source.late_start - duration < target.late_start:
                        target.late_start = source.late_start - duration
                        target.late_finish = target.late_start + target.duration

                case 'SF':
                    if target.late_start is None or source.late_finish - duration < target.late_start:
                        target.late_start = source.late_finish - duration
                        target.late_finish = target.late_start + target.duration

                case 'FF':
                    if target.late_finish is None or source.late_finish - duration < target.late_finish:
                        target.late_finish = source.late_finish - duration
                        target.late_start = target.late_finish - target.duration
            
            


def traverse_package_graph(graph):
    search_forward(graph)
    search_backward(graph)


<<<<<<< HEAD
def critical_path(graph):
    critical_path = []
    for start_node in graph.start_nodes:
        if start_node.float == 0:
            critical_path.append(start_node)
            for target, _, _ in graph.search(start_node):
                if target.float == 0:
                    critical_path.append(target)
    return critical_path
=======
if __name__ == '__main__':
    a = WorkPackage('a', 1, 2)
    b = WorkPackage('b', 3, 4)
    c = WorkPackage('c', 5, 6)
    d = WorkPackage('d', 7, 8)
    e = WorkPackage('e', 9, 10)

    graph = Graph()
    
    graph.add_edge(b, a, ('FS', 1))
    graph.add_edge(b, d, ('FS', 3))
    graph.add_edge(a, c, ('FS', 3))
    graph.add_edge(d, c, ('FS', 4))
    graph.add_edge(e, d, ('FS', 5))

    search_forward(graph)
    search_backward(graph)

    print('Critical path:')
    print(' -> '.join([node.name for node in critical_path(graph)]))

>>>>>>> b3e17a6 (Implemented SF, FF and SS cases. Fixed graph search)
