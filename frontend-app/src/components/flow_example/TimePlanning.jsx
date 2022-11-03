import React, {useCallback, useEffect, useState} from 'react';

import ReactFlow, {MarkerType, updateEdge, useEdgesState, useNodesState} from 'reactflow';

import CustomNode from './CostumNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CostumConnectionLine';
import "../../styles/Relations.scss"

import 'reactflow/dist/style.css';
import './style.css';
import {Typography} from "@mui/material";
import RelationsDialog from "./SimpleDialog";
import {client} from "../App";
import InfoDrawer from "../Drawer";
import {useNavigate} from "react-router-dom";
import Button from "../Button";

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
const idToName = {}
const idToDatabaseIDs = {}

const TimePlanning = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const navigate = useNavigate()

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
        await loadFromDatabase()
        await restoreFlow(tempNodes)
    }

    useEffect(() => {
        createNodes()
        }, [])

    const sendToDatabase = async (source, target, relation, duration) => {
        const id = (idToDatabaseIDs[`${source}${target}`]) ? idToDatabaseIDs[`${source}${target}`] : ""
        const datarelation = {
            source: source,
            target: target,
            relation: relation,
            duration: parseInt(duration)
        }
        const dataBaseId = await client.postRelation(id, JSON.stringify(datarelation))
        const index = relations.findIndex(relat => relat.source === datarelation.source && relat.target === datarelation.target)
        if (index !== -1){
            let relationsCopy = [...relations]
            relationsCopy[index] = datarelation
            setRelations(prevState => relationsCopy)
        }
        else {
            const newRelations = relations.concat([datarelation])
            setRelations(prevState => newRelations)
        }
        if (dataBaseId !== id){idToDatabaseIDs[`${source}${target}`] = dataBaseId.id}
    }

    const [relations, setRelations] = useState([])
    const loadFromDatabase = async() => {
        const relationsDatabase = await client.fetchRelations()
        const tempRelations = []
        const tempEdges = []
        relationsDatabase?.relations.forEach((relation) => {
            idToDatabaseIDs[`${relation.source}${relation.target}`] = relation.id
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
        setEdges(tempEdges)
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


    const [dialogState, setDialogState] = useState({})
    const handleConnect = (e) => {
        setNewEdge(e)
        console.log(relations)
        const relation = relations.find(relation => idToName[relation.source] === e.source && idToName[relation.target] === e.target)?.relation
        const duration = relations.find(relation => idToName[relation.source] === e.source && idToName[relation.target] === e.target)?.duration
        console.log("Duration :", duration)
        setDialogState(prevState => {return {
            "target": e.target,
            "source": e.source,
            "relation": relation,
            "duration": `${duration}`
        }})
        setOpen(true);
    }

    const [rfInstance, setRfInstance] = useState(null);
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

    const restoreFlow = async (tempNodes) => {
        const flow = await client.fetchTimePlanning()
        let allIncluded = true
        tempNodes.forEach(node => {
            if (flow.nodes.findIndex(flow_node => flow_node.id === node.id) === - 1) {
                flow.nodes.push(node)
            }
        })
        if (flow && allIncluded) {
            setNodes(flow.nodes || []);
        }
    }
    const toSummary = async () => {
        await saveFlow()
        navigate("/summary")
    }

    return (
        <div className="relations__outer">
            <div className={"infoGrid"} style={{"marginTop" : "30px"}}>
                <Typography variant={"h4"}>Time planning</Typography>
                <InfoDrawer
                    title={"Time planning"}
                    info_text={infoText}
                />
            </div>
            <div style={{
                height: window.innerHeight/1.5,
                width: "100%"
            }}>
                <RelationsDialog
                    selectedValue={selectedValue}
                    open={open}
                    onClose={handleClose}
                    handleSave={handleSave}
                    dialogState={dialogState}
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
                    defaultViewport={{x: 300, y: 1, zoom: 0.75}}
                    style={{"z-index": "0"}}
                />
            </div>
            <Button
                label={"Continue to summary"}
                onClick={toSummary}
                color={"lightblue"}
            />
        </div>
    );
};

export default TimePlanning;
