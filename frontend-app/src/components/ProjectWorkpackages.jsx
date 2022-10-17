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

const testObject = {
    "deliverables": {
        "Creating a backend-server": "Based on python and ajax-fetches",
        "Making a webpage": "Using React and CSS",
        "Reading project management literature": "Making sure our project uses the correct terms and research "
    },
    "subDeliverables": {},
    "projectGoal": "Making a working web-application"
}


export default function ProjectWorkpackages() {
    let {state} = useLocation()
    if (state === null) {state = testObject}
    const navigate = useNavigate()
    const [deliverables, setDeliverables] = useState({})
    useEffect(() => {
        let temp = {}
        if (JSON.stringify(state.subDeliverables) === "{}"){
            temp = Object.entries(state.deliverables).map(elem => elem[0])
        } else {
            temp = Object.entries(state.subDeliverables).map(elem => elem[0])
        }
        setDeliverables(() => {return temp})
    }, [])

    const [userState, setUserState] = useState( {
        "index": 0
    })
    const [workpackages, setWorkpackages] = useState({})

    const addWorkPackage = () => {
        const workPackage = {
            "duration": userState.duration,
            "name": userState.name,
            "resources": userState.resources,
            "sources": null
        }
        setWorkpackages(prevState => { return {...prevState, [userState.name]: workPackage}})
        setWorkPackageRows(prevState => {return prevState.concat([{
            "id": ((prevState?.at(-1)?.id) ? prevState?.at(-1)?.id + 1 : 1),
            "name": userState.name,
            "add_desc": userState.add_desc,
            "under_deliverable": deliverables[userState.index],
            "duration": userState.duration,
            'resources': userState.resources
        }])})
        setUserState(prevState => {return {...prevState, ["name"]: "", ["resources"]: "", ["duration"]: "", ["add_desc"]: ""}})
    }
    const [workPackageRows, setWorkPackageRows] = useState([])
    const workPackageColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Work-package', width: 200 },
        { field: 'under_deliverable', headerName: 'Connected to', width: 200 },
        { field: 'duration', headerName: 'Duration', width: 100 },
        { field: 'resources', headerName: 'Resources', width: 100 },
        { field: 'add_desc', headerName: 'Description', width: 300 },
    ];

    const changeHandler = (e) => {
        setUserState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }

    return (
        <div className="deliverables__grid">
            <div className={"deliverables__grid_left"}>
                <Typography className={"general__inner_element"} variant={"h5"}>
                    Deliverable : {deliverables[userState.index]}
                </Typography>
                <Typography className={"general__inner_element"}>
                    Break up your project deliverable into discrete work-packages
                </Typography>
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
                    name="add_desc"
                    value={userState.add_desc}
                    onChange={changeHandler}
                />

                <Button color="lightblue" label = "Add work-package" onClick={() => {
                    addWorkPackage()
                }}/>
                {userState.index < deliverables.length - 1 && <Button
                    label={"Next deliverable"}
                    onClick={() => setUserState(prevState => {return {...prevState, ["index"]: prevState.index + 1}})}
                />}
                {userState.index > 0 && <Button
                    label={"Previous deliverable"}
                    onClick={() => setUserState(prevState => {return {...prevState, ["index"]: prevState.index - 1}})}
                />}
                {userState.index === deliverables.length - 1 && <Button
                    label={"Continue to time planning"}
                    onClick={() => setUserState(prevState => {return {...prevState, ["index"]: prevState.index + 1}})}
                />}
            </div>
            <div className={"deliverables__grid_right"}>
                <Typography className={"general__inner_element"} variant={"h5"}>Work-Packages</Typography>
                <div className={"deliverables__tables"}>
                    <DataGrid
                        rows={workPackageRows}
                        columns={workPackageColumns}
                    />
                </div>
            </div>
        </div>
    );
}


