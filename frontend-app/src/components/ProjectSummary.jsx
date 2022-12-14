import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {client} from "./App";
import "../styles/ProjectOverview.scss"
import "../styles/Genereal.scss"
import "../styles/Deliverables.scss"
import {Typography} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import ReactFlow, {MarkerType, useEdgesState, useNodesState} from "reactflow";
import CustomConnectionLine from "./flow_example/CostumConnectionLine";
import CustomNode from "./flow_example/CostumNode";
import FloatingEdge from "./flow_example/FloatingEdge";
import {FitViewOptions} from "reactflow";

const initialEdges = [];
const connectionLineStyle = {
    strokeWidth: 3,
    stroke: 'black',
};

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const idToName = {}
const nameToId = {}
const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: 'black', "font-size": "28" },
    type: 'smoothstep',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'black',
    },
    label: "",
    labelStyle: {fontsize: "26"}
};

export default function ProjectSummary(){
    const navigate = useNavigate()
    const [projectInfo, setProjectInfo] = useState({})
    useEffect(() => {
        loadProjectInfo()
        loadWorkPackages()
        createNodes()
        loadResourceGraph()
    }, [])

    const loadProjectInfo = async () => {
        const projectInfo = await client.fetchProjectInfo()
        setProjectInfo(projectInfo.project)
        let tempDeliverablesRows = []
        let tempSubDeliverablesRows = []
        projectInfo?.project?.deliverables.forEach(deliverable => {
            const id = "deliv: " +  ((tempDeliverablesRows?.at(-1)?.id?.split(":")[1]) ? parseInt(tempDeliverablesRows?.at(-1)?.id?.split(":")[1]) + 1 : 1)
            tempDeliverablesRows = tempDeliverablesRows.concat([{
                "id": id,
                "name": deliverable.name,
                "description": deliverable.description
            }])
            deliverable?.subdeliverables?.forEach(subDeliverable => {
                const id = "subDeliv: " +  ((tempSubDeliverablesRows?.at(-1)?.id.split(" ")[1]) ? parseInt(tempSubDeliverablesRows?.at(-1)?.id.split(" ")[1]) + 1 : 1)
                tempSubDeliverablesRows = tempSubDeliverablesRows.concat([{
                    "id": id,
                    "name": subDeliverable.name,
                    "description": subDeliverable.description,
                    "under": deliverable.name
                }])
            })
        })
        setDeliverableRows(tempDeliverablesRows)
        setSubDeliverableRows(tempSubDeliverablesRows)
    }
    const loadWorkPackages = async () => {
        const workPackages = await client.fetchWorkPackages()
        const tempWorkPackageRows = []
        workPackages?.work_packages.forEach(pack => {
            const id = (tempWorkPackageRows?.at(-1)?.id) ? tempWorkPackageRows?.at(-1)?.id + 1 : 1
            const row = {
                "id": id,
                "name": pack.name,
                "description": pack.description,
                "duration": pack.duration,
                'resources': pack.resources
            }
            tempWorkPackageRows.push(row)
        })
        setWorkPackageRows(tempWorkPackageRows)
    }


    const [workPackageRows, setWorkPackageRows] = useState([])
    const workPackageColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Work-package', width: 200, editable: true },
        { field: 'duration', headerName: 'Duration', width: 100, editable: true },
        { field: 'resources', headerName: 'Resources', width: 100, editable: true },
        { field: 'description', headerName: 'Description', width: 300, editable: true },
    ];

    const [deliverableRows, setDeliverableRows] = useState([])
    const deliverableColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        { field: 'name', headerName: 'Deliverable', width: 200 , editable: true},
        { field: 'description', headerName: 'Description', width: 300, editable: true },
    ];
    const subDeliverablesColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {field: 'under', headerName: 'Connected to', width: 200, editable: false},
        { field: 'name', headerName: 'Sub-deliverable', width: 200, editable: true },
        { field: 'description', headerName: 'Description', width: 300, editable: true },
    ];
    const [subDeliverableRows, setSubDeliverableRows] = useState([])


    const [nodes, setNodes, onNodesChange] = useNodesState([]);

    const createNodes = async () => {
        const response = await client.fetchWorkPackages()
        const workPackages = response?.work_packages
        let x_pos = 50;
        let y_pos = 80;
        const tempNodes = workPackages.map((pack) => {
            x_pos = x_pos + 50
            nameToId[`${pack?.name}`] = pack?.id
            idToName[`${pack?.id}`] = pack?.name
            return {
                id: `${pack.name}`,
                type: 'custom',
                data: {label: pack?.name, duration: pack?.duration, description: pack?.description},
                position: { x: x_pos, y: y_pos }
            }
        })
        setNodes(tempNodes)
        const edges = await loadNodesFromDatabase()
        const restoredNodes = await restoreFlow(tempNodes)
        await create_critical_path(restoredNodes, edges)
    }

    const [relations, setRelations] = useState([])
    const loadNodesFromDatabase = async() => {
        const relationsDatabase = await client.fetchRelations()
        const tempRelations = []
        const tempEdges = []
        relationsDatabase?.relations.forEach((relation) => {
            tempRelations.push(relation)
            tempEdges.push({
                style: { strokeWidth: 3, stroke: 'black', "font-size": "28" },
                type: 'smoothstep',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: 'black',
                },
                source: idToName[`${relation.source}`],
                target: idToName[`${relation.target}`],
                sourceHandle: null,
                targetHandle: null,
                label: `${relation.relation} (${relation.duration})`,
                labelStyle: {fontsize: "26"}
            })
        })
        setRelations(tempRelations)
        return tempEdges
    }
    const [rfInstance, setRfInstance] = useState(null);
    const restoreFlow = async (tempNodes) => {
        const flow = await client.fetchTimePlanning()
        let allIncluded = true
        tempNodes.forEach(node => {
            if (flow.nodes.findIndex(flow_node => flow_node.id === node.id) === - 1) {
                allIncluded = false
            }
        })
        if (flow && allIncluded) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setNodes(flow.nodes || []);
            console.log(flow.nodes)
            return (flow.nodes || [])
        }

    }
    const [reactFlow, setReactFlow] = useState([])
    const create_critical_path = async (loaded_nodes, edges) => {
        const time_schedule = await client.fetchTimeSchedule()
        const tempNodes = []
        console.log(loaded_nodes)
        for (const key in time_schedule) {
            if (time_schedule.hasOwnProperty(key)) {
                const pack = time_schedule[key]
                const equalNode = loaded_nodes.find(node => node.id === `${key}`)
                tempNodes.push({
                    id: `${key}`,
                    type: 'custom',
                    data: {
                        label: key,
                        early_finish: pack?.early_finish,
                        early_start: pack?.early_start,
                        float: pack?.float,
                        late_finish: pack?.late_finish,
                        late_start: pack?.late_start,
                        duration: pack?.duration
                    },
                    position: {x: equalNode?.position.x, y: equalNode?.position.y}
                })
            }
        }
        setNodes(tempNodes)
        console.log(tempNodes)
        setReactFlow(_ => {
            return (tempNodes.length !== 0) ?
                 [<ReactFlow
                    style={{"z-index": "0"}}
                    zoomOnScroll={false}
                    preventScrolling={false}
                    nodes={tempNodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineComponent={CustomConnectionLine}
                    connectionLineStyle={connectionLineStyle}
                    onInit={setRfInstance}
                    fitView
                />]
            : []
        })
    }
    const [svgImage, setSvgImage] = useState("")
    const loadResourceGraph = async () => {
        const resourceGraph = await client.fetchResourceUse()
        console.log(resourceGraph.svg_data)
        setSvgImage(_ => resourceGraph.svg_data)
    }

    return (
        <div className={"general__outer_div"}>
            <Typography variant={"h3"}>{projectInfo.name}: </Typography>
            <Typography>{projectInfo.description}</Typography>
            {reactFlow?.length !== 0 && <div>
                <Typography className={"general__inner_element"} variant={"h5"}>Time-planning:</Typography>
                <Typography className={"general__inner_element"}>Red path is critical path</Typography>
                <div style={{
                    height: window.innerHeight/2,
                    width: "100%"
                }}>
                    {reactFlow}
                </div>
            </div>}
            {svgImage?.length !== 0 && <div>
                <Typography className={"general__inner_element"} variant={"h5"}>Resource usage: </Typography>
                <div className={"general__inner_element"} dangerouslySetInnerHTML={{__html: svgImage}}>
                </div>
            </div>}


            <div className="deliverables__grid">
                <div className={"deliverables__grid_left"}>
                    <Typography className={"general__inner_element"} variant={"h5"}>Deliverables</Typography>
                    <div className={"deliverables__tables"}>
                        <DataGrid
                            rows={deliverableRows}
                            columns={deliverableColumns}
                        />
                    </div>
                </div>
                {!projectInfo?.deliverable_only && <div className={"deliverables__grid_right"}>
                    <div>
                        <Typography className={"general__inner_element"} variant={"h5"}>Sub-Deliverables</Typography>
                        <div className={"deliverables__tables"}>
                            <DataGrid
                                rows={subDeliverableRows}
                                columns={subDeliverablesColumns}
                            />
                        </div>
                    </div>
                </div>}
                {projectInfo?.deliverable_only && <div className={"deliverables__grid_right"}>
                    <div>
                        <Typography className={"general__inner_element"} variant={"h5"}>Work-Packages</Typography>
                        <div className={"deliverables__tables"}>
                            <DataGrid
                                rows={workPackageRows}
                                columns={workPackageColumns}
                            />
                        </div>
                    </div>
                </div>}
            </div>
            {!projectInfo?.deliverable_only && <div style={{"padding-right": "200px", "padding-top": "50px"}}>
                <Typography className={"general__inner_element"} variant={"h5"}>Work-Packages</Typography>
                <div className={"deliverables__tables"}>
                    <DataGrid
                        rows={workPackageRows}
                        columns={workPackageColumns}
                    />
                </div>
            </div>}
        </div>
    )
}
