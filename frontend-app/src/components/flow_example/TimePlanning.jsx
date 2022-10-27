import React, {useCallback, useEffect, useState} from 'react';

import ReactFlow, {addEdge, useNodesState, useEdgesState, MarkerType, updateEdge} from 'reactflow';

import CustomNode from './CostumNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CostumConnectionLine';
import "../../styles/Relations.scss"

import 'reactflow/dist/style.css';
import './style.css';
import TextInput from "../TextInput";
import {Typography} from "@mui/material";
import Button from "../Button";
import SimpleDialog from "./SimpleDialog";
import RelationsDialog from "./SimpleDialog";
import {client} from "../App";

const work_packages_example = [
    {
        name: "test1",
        id: "1",
        duration: "2"
    },
    {
        name: "test2",
        id: "2",
        duration: "2"
    },
    {
        name: "test3",
        id: "3",
        duration: "2"
    },
    {
        name: "test4",
        id: "4",
        duration: "2"
    }
]

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
        // sendToDatabase(newEdge?.source, newEdge?.target, relation, duration)
        newEdge.label = `${relation} (${duration})`
        sendToDatabase(nameToId[`${newEdge.source}`], nameToId[`${newEdge.target}`], relation, duration)
        onConnect(newEdge)
        // console.log(newEdge)
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

    const onSave = useCallback(() => {

        if (rfInstance) {
            console.log("Hello")
            const flow = rfInstance.toObject();
            localStorage.setItem(flowKey, JSON.stringify(flow));
        }
    }, [rfInstance]);

    return (
        <div className="relations__outer">
            <Typography style={{"margin-left": "50px"}} variant={"h3"}>Time planning</Typography>
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
                    onNodeDoubleClick={onSave}
                />
            </div>

        </div>
    );
};

export default TimePlanning;
