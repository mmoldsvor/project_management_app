from collections import defaultdict
import matplotlib.pyplot as plt

def work_package_graph(graph):
    x = [i for i in range(max(node.early_finish for node in graph.end_nodes) + 2)]
    y = defaultdict(list)

    for node in graph.nodes:
        for i in x:
            if node.early_start + 1 <= i <= node.early_finish:
                y[node.name].append(node.resources)
            else:
                y[node.name].append(0)
    return x,y

def temp_render(x, y):
    plt.stackplot(x, *y.values(), step = 'pre', alpha = 0.7, linewidth = 1, edgecolors = 'black')
    plt.legend(y.keys())
    plt.ylim(bottom=0)
    plt.ylabel("Resources")
    plt.xlabel("Days")
    plt.show()
