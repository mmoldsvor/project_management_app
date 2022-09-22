from collections import defaultdict


class Graph:
    def __init__(self):
        self.graph = defaultdict(list) 
        self.graph_reverse = defaultdict(list) 

    def add_edge(self, source, target, edge):
        self.graph[source].append((target, edge))
        self.graph_reverse[target].append((source, edge))

    def search(self, start_node, reversed=False):
        graph = self.graph if not reversed else self.graph_reverse
        visited = [start_node]
        queue = [start_node]

        while queue:
            source = queue.pop(0)
            for target, edge in graph[source]:
                yield source, target, edge

                if target not in visited:
                    visited.append(target)
                    queue.append(target)

    @property
    def start_nodes(self):
        targets = set([value for sublist in self.graph.values() for value, _ in sublist])
        sources = set(self.graph.keys()) 
        return sources - targets

    @property
    def end_nodes(self):
        targets = set([value for sublist in self.graph_reverse.values() for value, _ in sublist])
        sources = set(self.graph_reverse.keys()) 
        return sources - targets

