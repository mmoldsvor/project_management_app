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

// const idToNames = {}
// const idToDatabaseIDs = {}

const TimePlanning = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const createNodes = (workPackages) => {
        let x_pos = 50;
        let y_pos = 80;

        const tempNodes = workPackages.map((pack) => {
            console.log(pack?.id)
            x_pos = x_pos + 20
            // idToNames[`${pack?.id}`] = pack?.name
            return {
                id: pack.name,
                type: 'custom',
                data: {label: pack?.name, duration: pack?.duration},
                position: { x: x_pos, y: y_pos }
            }
        })
        setNodes(tempNodes)
    }
    useEffect(() => createNodes(work_packages_example), [])

    // const sendToDatabase = async (source, target, relation, duration) => {
    //     const id = (idToDatabaseIDs[`${source}${target}`]) ? idToDatabaseIDs[`${source}${target}`] : ""
    //     const data = {
    //         source: source,
    //         taget: target,
    //         relation: relation,
    //         duration: duration
    //     }
    //     const dataBaseId = await client.postRelation(id, JSON.stringify(data))
    //     if (dataBaseId !== id){idToDatabaseIDs[`${source}${target}`] = dataBaseId}
    // }
    //
    // const loadFromDatabase = async() => {
    //     const relations = await client.fetchRelations()
    //     const tempEges = relations?.relations.map((relation) => {
    //
    //
    //     })
    // }

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge(params, eds))
    },  [setEdges])

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
        console.log(edges)
        onConnect(newEdge)
        // console.log(newEdge)
    }
    const handleConnect = (e) => {
        setNewEdge(e)
        setTarget(e.target)
        setSource(e.source)
        setOpen(true);
    }

    const [source, setSource] = useState("")
    const [target, setTarget] = useState("")
    const [newEdge, setNewEdge] = useState()
    const onEdgeUpdate = useCallback(
        (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
        []
    );

    return (
        <div className="relations__outer">
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
                    onSelectionChange={e => console.log(e)}
                    onEdgeUpdate={onEdgeUpdate}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineComponent={CustomConnectionLine}
                    connectionLineStyle={connectionLineStyle}
                />
            </div>
        </div>
    );
};

export default TimePlanning;
