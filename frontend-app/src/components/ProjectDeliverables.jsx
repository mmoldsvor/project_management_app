import '../App.css';
import {FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import "../styles/Genereal.scss"
import "../styles/Datepicker.scss"
import "../styles/Deliverables.scss"
import Button from "./Button"
import TextInput from "./TextInput"
import {client} from "./App"

const databaseIDs = {}
export default function ProjectDeliverables() {
    const navigate = useNavigate()
    const [userState, setUserState] = useState({
        "index": 0,
        "layers": "2"
    })
    const changeHandler = (e) => {
        setUserState(prevState => {return {...prevState, [e.target.name]: e.target.value}})
    }
    const [projectInfo, setProjectInfo] = useState({})
    const loadProjectInfo = async () => {
        const projectInfo = await client.fetchProjectInfo()
        setProjectInfo(projectInfo.project)
        const tempDeliverables = {}
        let tempDeliverablesRows = []
        let tempSubDeliverablesRows = []
        const tempSubDeliverables = {}
        projectInfo.project.deliverables.forEach((deliverable) => console.log(deliverable))
        projectInfo?.project?.deliverables.forEach(deliverable => {
            setWorkingOn("deliverables")
            tempDeliverables[deliverable.name] = deliverable.description
            const id = "deliv: " +  ((tempDeliverablesRows?.at(-1)?.id?.split(":")[1]) ? parseInt(tempDeliverablesRows?.at(-1)?.id?.split(":")[1]) + 1 : 1)
            databaseIDs[`${id}`] = deliverable.id
            tempDeliverablesRows = tempDeliverablesRows.concat([{
                "id": id,
                "name": deliverable.name,
                "description": deliverable.description
            }])
            deliverable?.subdeliverables?.forEach(subDeliverable => {
                tempSubDeliverables[subDeliverable.name] = subDeliverable.description
                const id = "subDeliv: " +  ((tempSubDeliverablesRows?.at(-1)?.id.split(" ")[1]) ? parseInt(tempSubDeliverablesRows?.at(-1)?.id.split(" ")[1]) + 1 : 1)
                databaseIDs[`${id}`] = subDeliverable.id
                tempSubDeliverablesRows = tempSubDeliverablesRows.concat([{
                    "id": id,
                    "name": subDeliverable.name,
                    "description": subDeliverable.description,
                    "under": deliverable.name
                }])
            })
        })
        setSubDeliverables(tempSubDeliverables)
        setDeliverableRows(tempDeliverablesRows)
        setSubDeliverableRows(tempSubDeliverablesRows)
        setDeliverables(tempDeliverables)
    }
    useEffect(() => {

        loadProjectInfo()
    }, [])

    const [deliverables, setDeliverables] = useState({})
    const [subDeliverables, setSubDeliverables] = useState({})

    const updateDeliverableRow = async (e) => {
        const rowIndex = deliverableRows.findIndex(element => element.id === e.id)
        deliverableRows[rowIndex][e.field] = e.value
        await sendToDatabase(e.id, deliverableRows[rowIndex])
    }
    const updateSubDeliverableRow = async (e) => {
        const rowIndex = subDeliverableRows.findIndex(element => element.id === e.id)
        subDeliverableRows[rowIndex][e.field] = e.value
        await sendToDatabase(e.id, subDeliverableRows[rowIndex])
    }


    const sendToDatabase = async (id, row) => {
        const databaseID = (databaseIDs[`${id}`]) ? databaseIDs[`${id}`] : ""
        const data = {
            "name": row.name,
            "description": row.description,
        }

        if (row?.under !== undefined){
            const deliverableID = databaseIDs[`${deliverableRows.find(elem => elem.name === row.under).id}`]
            const testID = await client.postSubDeliverable(deliverableID, databaseID, JSON.stringify(data))
            if (databaseIDs[`${id}`] === undefined) {databaseIDs[`${id}`] = testID.id}
        }
        else {
            const testID = await client.postDeliverable(databaseID, JSON.stringify(data))
            if (databaseIDs[`${id}`] === undefined) {databaseIDs[`${id}`] = testID.id}
            await loadProjectInfo()
        }
    }

    const addRow = async (rowType, name, desc, index) => {
        if (rowType === "deliverables"){
            const id = "deliv: " +  ((deliverableRows?.at(-1)?.id?.split(":")[1]) ? parseInt(deliverableRows?.at(-1)?.id?.split(":")[1]) + 1 : 1)
            const row = {
                "id": id,
                "name": name,
                "description": desc
            }
            await sendToDatabase(id, row)
            setDeliverables(prevState => {return {...prevState, [name]: desc}})
            setDeliverableRows(prevState => {return prevState.concat([row])})
        }
        else if (rowType === "sub_deliverables"){
            const id = "subDeliv: " +  ((subDeliverableRows?.at(-1)?.id.split(" ")[1]) ? parseInt(subDeliverableRows?.at(-1)?.id.split(" ")[1]) + 1 : 1)
            const row = {
                "id": id,
                "name": name,
                "description": desc,
                "under": deliverableRows.at(index)?.name
            }
            await sendToDatabase(id, row)
            setSubDeliverables(prevState => {return {...prevState, [name]: desc}})
            setSubDeliverableRows(prevState => {return prevState.concat([row])})
        }
    }
    const [workingOn, setWorkingOn] = useState("layers")
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
    const navigateToWorkPackages = () => {
        return (
            navigate("/work-packages", {state: {
                    "deliverables": deliverables,
                    "subDeliverables" : subDeliverables,
                    "projectInfo": projectInfo
                }})
        )
    }
    return (
        <div className="deliverables__grid">
            <div className={"deliverables__grid_left"}>
                <Typography className={"general__inner_element"} variant={"h5"}>Project goal:</Typography>
                <Typography className={"general__inner_element"} variant={"h4"}>{projectInfo?.name}</Typography>
                {workingOn === "layers" && <ProjectGoal onContinue={setWorkingOn} changeHandler={changeHandler}/>}
                {workingOn === "deliverables" && <Deliverables
                    setWorkingOn={setWorkingOn}
                    addRow={addRow}
                />}

                {workingOn === "subDeliverables" && userState.layers === "2" && <SubDeliverables
                    deliverableRows={deliverableRows}
                    setWorkingOn={setWorkingOn}
                    addRow={addRow}
                    navigateToWorkPackages={navigateToWorkPackages}
                />}
                {workingOn === "subDeliverables" && userState.layers === "1" && navigateToWorkPackages()}
            </div>

            <div className={"deliverables__grid_right"}>
                <Typography className={"general__inner_element"} variant={"h5"}>Deliverables</Typography>
                <div className={"deliverables__tables"}>
                    <DataGrid
                        rows={deliverableRows}
                        columns={deliverableColumns}
                        onCellEditCommit={e => updateDeliverableRow(e)}
                    />
                </div>
                {userState.layers === "2" && <div>
                    <Typography className={"general__inner_element"} variant={"h5"}>Sub-deliverables</Typography>
                    <div className={"deliverables__tables"}>
                        <DataGrid
                            onCellEditCommit={e => updateSubDeliverableRow(e)}
                            rows={subDeliverableRows}
                            columns={subDeliverablesColumns}
                        />
                    </div>
                </div>}
            </div>
        </div>
    );
}

function ProjectGoal(props){
    return (
        <div>
            <Typography className={"general__inner_element"} variant={"body1"}>
                How many layers of deliverables do you want to divide your project into?
            </Typography>
            <RadioGroup
                onChange={props.changeHandler}
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="2"
                name="layers"
            >
                <FormControlLabel value="2" control={<Radio />} label="Deliverables and Sub-deliverables" />
                <FormControlLabel value="1" control={<Radio />} label="Only deliverables" />
            </RadioGroup>
            <Button
                onClick={() => props.onContinue("deliverables")}
                label={"Continue"}
                color={"lightBlue"}
            />
        </div>
    )
}

function Deliverables(props){
    const addDeliverables = async () => {
        if (state?.deliverable_name !== "" && state?.deliverable_desc !== ""){
            await props.addRow("deliverables", state.deliverable_name, state.deliverable_desc)
            setState(prevState => {
                return {...prevState, ["deliverable_name"]: "" , ["deliverable_desc"]: ""}
            })
        }
    }
    const changeHandler = (e) => {
        setState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }
    const [state, setState] = useState({
        deliverable_name: "",
        deliverable_desc: ""
    })
    return(
        <div>
            <Typography className={"general__inner_element"}>
                Break up your project goal into deliverables
            </Typography>
            <TextInput
                className={"general__text_input"}
                label="Deliverable name - f.ex: Create a backendserver"
                name="deliverable_name"
                value={state.deliverable_name}
                onChange={changeHandler}
            />
            <TextInput
                className={"general__text_input__large"}
                label="Description - A backserver based on kotlin and ktor..."
                name="deliverable_desc"
                value={state.deliverable_desc}
                onChange={changeHandler}
            />
            <Button className={"general__button__main"} label = "Add deliverable" onClick={() => addDeliverables()}/>
            <Button className={"general__button__secondary"} label={"Continue"} onClick={() => props.setWorkingOn("subDeliverables")}/>
        </div>
    )
}

function SubDeliverables(props){
    const addSubDeliverables = async () => {
        if (state?.sub_deliverable_name !== "" && state?.sub_deliverable_desc !== "") {
            await props.addRow("sub_deliverables", state.sub_deliverable_name, state.sub_deliverable_desc, index)
            setState(prevState => {
                return {...prevState, ["sub_deliverable_name"]: "", ["sub_deliverable_desc"]: ""}
            })
        }
    }
    const changeHandler = (e) => {
        setState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }
    const [state, setState] = useState({
        sub_deliverable_name: "",
        sub_deliverable_desc: "",
    })

    const [index, setIndex] = useState(0)
    return(
        <div>
            <Typography>
                Break up your deliverables into sub-deliverables
            </Typography>
            <br/>
            <Typography variant={"h6"}>
                {props.deliverableRows.at(index)?.name}
            </Typography>
            <TextInput
                className={"general__text_input"}
                label="Sub-deliverable name - f.ex: Implement authentication"
                name="sub_deliverable_name"
                value={state.sub_deliverable_name}
                onChange={changeHandler}
            />
            <TextInput
                className={"general__text_input__large"}
                label="Description - authentication based on openid"
                name="sub_deliverable_desc"
                value={state.sub_deliverable_desc}
                onChange={changeHandler}
            />

            <Button color="lightblue" label = "Add sub-deliverable" onClick={() => addSubDeliverables()}/>
            {index < props.deliverableRows.length - 1 && <Button
                label={"Next deliverable"}
                onClick={() => setIndex(prevState => {return prevState + 1})}
            />}
            {index > 0 && <Button
                label={"Previous deliverable"}
                onClick={() => setIndex(prevState => {return prevState - 1})}
            />}
            {index === props.deliverableRows.length - 1 && <Button
                label={"Continue to workpackages"}
                onClick={() => props.navigateToWorkPackages()}
            />}
            {index === 0 && <Button label={"Back to deliverables"} onClick={() => props.setWorkingOn("deliverables")}/>}
        </div>
    )
}




