import '../App.css';
import {Checkbox, FormControlLabel, FormGroup, FormLabel, Typography} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import "../styles/Genereal.scss"
import DatePicker from "react-datepicker";
import "../styles/Datepicker.scss"
import Button from "./Button";
import TextInput from "./TextInput";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {client} from "./App";
import InfoDrawer from "./Drawer";

const testObject = {
    "deliverables": {
        "Creating a backend-server": "Based on python and ajax-fetches",
        "Making a webpage": "Using React and CSS",
        "Reading project management literature": "Making sure our project uses the correct terms and research "
    },
    "subDeliverables": {},
    "projectGoal": "Making a working web-application"
}

const infoText = `Work package: the work packages are a special form of components that have the following characteristics [4]:
    • Forms lowest level in WBS*.
    • Must have a deliverable result.
    • It has one owner. 
    • It may be considered by its owner as a project in itself. 
    • It may include several milestones. 
    • A work package should fit organizational procedures and culture. 
    • The optimal size may be expressed in terms on labour hours, calendar time, cost, reporting period, and risks.

Warning: Work packages should not be too small as to make cost of control excessive and not so large as to make the risk unacceptable.
*WBS: Work Breakdown Structures is a hierarchical decomposition of the work to be executed by the project team in order to accomplish the project objectives and create the required deliverables [3]
Resources: a stock or supply of money, materials, staff, and other assets that can be drawn on by a person or organization in order to function effectively [5].
Time: the duration of your work package for instance hours, days, weeks, etc. `


const databaseIDs = {}
export default function ProjectWorkpackages() {
    let {state} = useLocation()
    if (state === null) {state = testObject}
    const navigate = useNavigate()

    const [deliverablesAndSubDeliverables, setDeliverablesAndSubDeliverables] = useState([])
    const loadDeliverablesAndSubDeliverables = async () => {
        const projectInfo = await client.fetchProjectInfo()
        const tempDeliverablesAndSubDeliverables = []
        projectInfo?.project?.deliverables.forEach(deliverable => {
            tempDeliverablesAndSubDeliverables.push({
                name: deliverable.name,
                description: deliverable.description})
            deliverable?.subdeliverables?.forEach(subDeliverable => {
                tempDeliverablesAndSubDeliverables.push({
                    name: subDeliverable.name,
                    description: subDeliverable.description
                })
            })
        })
        setDeliverablesAndSubDeliverables(tempDeliverablesAndSubDeliverables)
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
            databaseIDs[`${id}`] = pack.id
            tempWorkPackageRows.push(row)
        })
        setWorkPackageRows(tempWorkPackageRows)
    }

    useEffect(() => {
        loadDeliverablesAndSubDeliverables()
        loadWorkPackages()
    }, [])

    const [userState, setUserState] = useState( {
        "index": 0,
        name: "",
        description: "",
        resources: "",
        duration: ""
    })


    const addWorkPackage = async () => {

        if (userState.name === "" || userState.duration === "" || userState.resources === "") {return}
        const row = {
            "id": ((workPackageRows?.at(-1)?.id) ? workPackageRows?.at(-1)?.id + 1 : 1),
            "name": userState.name,
            "description": userState.description,
            "duration": userState.duration,
            'resources': userState.resources
            }

        const resp = await sendWorkPackageToDatabase(undefined, row)
        console.log(resp)
        if (resp?.id === undefined) {return}
        setUserState(prevState => {
            return {...prevState, ["name"]: "", ["resources"]: "", ["duration"]: "", ["description"]: ""}
        })
        const newRows = workPackageRows.concat([row])
        setWorkPackageRows(prevState => newRows)
    }

    const sendWorkPackageToDatabase = async (id, row) => {
        const databaseID = (id !== undefined && databaseIDs[`${id}`]) ? databaseIDs[`${id}`] : ""
        const workPackage = {
            "duration": row.duration,
            "description": row.description,
            "name": row.name,
            "resources": row.resources,
            // "subdeliverable_id",
            // "deliverable_id",
        }
        const temp_id = await client.postWorkPackage(databaseID, JSON.stringify(workPackage))
        if (databaseID === "") {databaseIDs[`${id}`] = temp_id.id}
        return temp_id
    }
    const updateWorkPackage = async (e) => {
        const rowIndex = workPackageRows.findIndex(element => element.id === e.id)
        workPackageRows[rowIndex][e.field] = e.value
        await sendWorkPackageToDatabase(e.id, workPackageRows[rowIndex])
    }
    const [workPackageRows, setWorkPackageRows] = useState([])
    const workPackageColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Work-package', width: 200, editable: true },
        { field: 'duration', headerName: 'Duration', width: 100, editable: true },
        { field: 'resources', headerName: 'Resources', width: 100, editable: true },
        { field: 'description', headerName: 'Description', width: 300, editable: true },
    ];

    const changeHandler = (e) => {
        setUserState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }

    return (
        <div style={{"padding-left": "50px"}}>
            <div className="deliverables__grid">
                <div className={"deliverables__grid_left"}>
                    <Typography className={"general__inner_element"}  variant={"h4"}>Work-packages</Typography>
                    <Typography className={"general__inner_element"} variant={"h5"}>
                        Deliverable : {deliverablesAndSubDeliverables[userState.index]?.name}
                    </Typography>
                    <Typography className={"general__inner_element"}>
                        Break up your project deliverable into discrete work-packages
                    </Typography>
                    <InfoDrawer
                        title={"Work-packages"}
                        info_text={infoText}
                    />
                    <TextInput
                        className={"general__text_input"}
                        label="Work-package name - f.ex: Fix necessary firewall permissions"
                        name="name"
                        value={userState.name}
                        onChange={changeHandler}
                    />
                    <TextInput
                        className={"general__text_input"}
                        label="Work-package duration - f.ex: 1-4"
                        name="duration"
                        value={userState.duration}
                        onChange={changeHandler}
                    />
                    <TextInput
                        className={"general__text_input"}
                        label="Work-package resources - f.ex: 4"
                        name="resources"
                        value={userState.resources}
                        onChange={changeHandler}
                    />
                    <TextInput
                        className={"general__text_input__large"}
                        label="Additional description - f.ex remember to document the process"
                        name="description"
                        value={userState.description}
                        onChange={changeHandler}
                    />

                    <Button color="lightblue" label = "Add work-package" onClick={() => {
                        addWorkPackage()
                    }}/>
                    {userState.index < deliverablesAndSubDeliverables.length - 1 && <Button
                        label={"Next deliverable"}
                        onClick={() => setUserState(prevState => {return {...prevState, ["index"]: prevState.index + 1}})}
                    />}
                    {userState.index > 0 && <Button
                        label={"Previous deliverable"}
                        onClick={() => setUserState(prevState => {return {...prevState, ["index"]: prevState.index - 1}})}
                    />}
                    <Button
                        label={"Continue to time planning"}
                        onClick={() => navigate("/time-planning")}
                    />
                </div>
                <div className={"deliverables__grid_right"}>
                    <Typography className={"general__inner_element"} variant={"h5"}>Work-Packages</Typography>
                    <div className={"deliverables__tables"}>
                        <DataGrid
                            rows={workPackageRows}
                            onCellEditCommit={e => updateWorkPackage(e)}
                            columns={workPackageColumns}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


