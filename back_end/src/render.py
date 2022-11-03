from collections import defaultdict
import matplotlib.pyplot as plt
from io import StringIO

def work_package_graph(graph):
    x = [i for i in range(max(node.early_finish for node in graph.end_nodes) + 2)]
    y = defaultdict(list)

    for node in graph.nodes:
        for i in x:
            if node.early_start + 1 <= i <= node.early_finish:
                y[node.name].append(node.resources)
            else:
                y[node.name].append(0)
    return work_package_render(x, y)

def work_package_render(x, y):
    fig = plt.stackplot(x, *y.values(), step = 'pre', alpha = 0.7, linewidth = 1, edgecolors = 'black')
    plt.legend(y.keys())
    plt.ylim(bottom=0)
    plt.ylabel("Resources")
    plt.xlabel("Days")

    imgdata = StringIO()
    fig.savefig(imgdata, format = 'svg')

    return imgdata.getvalue()

   
