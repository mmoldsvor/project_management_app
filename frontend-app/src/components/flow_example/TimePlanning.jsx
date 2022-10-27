import React, {useCallback, useEffect, useState} from 'react';

import ReactFlow, {addEdge, useNodesState, useEdgesState, MarkerType, updateEdge, useReactFlow} from 'reactflow';

import CustomNode from './CostumNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CostumConnectionLine';
import "../../styles/Relations.scss"

import 'reactflow/dist/style.css';
import './style.css';
import TextInput from "../TextInput";
import {FormLabel, Typography} from "@mui/material";
import Button from "../Button";
import SimpleDialog from "./SimpleDialog";
import RelationsDialog from "./SimpleDialog";
import {client} from "../App";
import InfoDrawer from "../Drawer";

const infoText = `Finish to start: task B can only start when task A is done
Finish to finish: task B cannot be completed as long as task A is not done
Start to start: task B cannot be initiated as long as task A has not started
Start to finish: the beginning of task A coincides with the end of task B [notes in class]

Between two task a delayed on relation can be added, for example F(2) between a finish to start would mean that project B starts 2 days after project A is done.`

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

const nameToId = {}
const idToDatabaseIDs = {}
const flowKey = 'timeplanning-flow';

const TimePlanning = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const createNodes = async () => {
        const response = await client.fetchWorkPackages()
        const workPackages = response?.work_packages
        let x_pos = 50;
        let y_pos = 80;
        const tempNodes = workPackages.map((pack) => {
            x_pos = x_pos + 50
            nameToId[`${pack?.name}`] = pack?.id
            return {
                id: `${pack.name}`,
                type: 'custom',
                data: {label: pack?.name, duration: pack?.duration, description: pack?.description},
                position: { x: x_pos, y: y_pos }
            }
        })
        setNodes(tempNodes)
        await loadFromDatabase()
    }

    useEffect(() => {
        createNodes()
        }, [])

    const sendToDatabase = async (source, target, relation, duration) => {
        const id = (idToDatabaseIDs[`${source}${target}`]) ? idToDatabaseIDs[`${source}${target}`] : ""
        const data = JSON.stringify({
            source: source,
            target: target,
            relation: relation,
            duration: parseInt(duration)
        })
        const dataBaseId = await client.postRelation(id, data)
        if (dataBaseId !== id){idToDatabaseIDs[`${source}${target}`] = dataBaseId.id}
    }

    const loadFromDatabase = async() => {
        const relations = await client.fetchRelations()
        relations?.relations.forEach((relation) => {
            idToDatabaseIDs[`${relation.source}${relation.target}`] = relation.id
        })
    }

    const onConnect = useCallback((edge) => {
        setEdges((eds) => {
            const index = edges.findIndex(edg => {
                return (edg.target === edge.target && edg.source === edge.source)
            })
            if (index === -1) {
                return eds.concat([edge])
            }
            else {
                eds[index] = edge
                return eds
            }
        }, )},  [setEdges])

    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState();

    const handleClose = (value: string) => {
        setOpen(false);
        setSelectedValue(value);
    };


    const handleSave = (relation : string, duration : string) => {
        setOpen(false)
        newEdge.label = `${relation} (${duration})`
        sendToDatabase(nameToId[`${newEdge.source}`], nameToId[`${newEdge.target}`], relation, duration)
        onConnect(newEdge)
        saveFlow()
    }

    const handleConnect = (e) => {
        setNewEdge(e)
        setTarget(e.target)
        setSource(e.source)
        setOpen(true);
    }

    const [rfInstance, setRfInstance] = useState(null);
    const [source, setSource] = useState("")
    const [target, setTarget] = useState("")
    const [newEdge, setNewEdge] = useState()
    const onEdgeUpdate = useCallback(
        (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
        []
    );

    const saveFlow = async () => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            const clientResponse = await client.postTimePlanning(JSON.stringify(flow))
            console.log(clientResponse)
        }
    }

    const restoreFlow = async () => {
        const flow = JSON.parse(await client.fetchTimePlanning())
        console.log(flow)
        if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
        }
    }


    return (
        <div className="relations__outer">

            <div className={"infoGrid"}>
                <Typography style={{"margin-left": "50px"}} variant={"h3"}>Time planning</Typography>
                <InfoDrawer
                    title={"Time planning"}
                    info_text={infoText}
                />
            </div>
            <div style={{
                height: window.innerHeight,
                width: "98%"
            }}>
                <RelationsDialog
                    selectedValue={selectedValue}
                    open={open}
                    onClose={handleClose}
                    handleSave={handleSave}
                    target={target}
                    source={source}
                />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineComponent={CustomConnectionLine}
                    connectionLineStyle={connectionLineStyle}
                    onInit={setRfInstance}
                    onNodeDoubleClick={restoreFlow}
                />
            </div>

        </div>
    );
};

export default TimePlanning;
