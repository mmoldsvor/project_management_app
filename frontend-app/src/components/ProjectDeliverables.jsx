import '../App.css';
import {Box, FormControlLabel, Radio, RadioGroup, TextField, Typography} from "@mui/material";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import "../styles/Genereal.scss"
import "../styles/Datepicker.scss"
import "../styles/Deliverables.scss"
import Button from "./Button"
import TextInput from "./TextInput"
const info = "Project Type is one of the root characteristics of a project, which points its nature. Usually project type is a high-level definition of a project that helps to identify methodologies to be suitable, objects and resources to be involved into the project, and nature of products to be generated by this project. When an organization operates a conception of project type, this may indicate that this organization possesses different templates for different project types – these templates package suitable elements and tools to plan, manage, and control every conventional type of projects. Projects are classified by the following categories (the major ones): "

export default function ProjectDeliverables() {
    const {state} = useLocation()
    const navigate = useNavigate()
    const [userState, setUserState] = useState({
        "index": 0,
        "layers": "2"
    })
    const changeHandler = (e) => {
        setUserState(prevState => {return {...prevState, [e.target.name]: e.target.value}})
    }

    const [projectGoal, setProjectGoal] = useState()
    const [deliverables, setDeliverables] = useState({})
    const [subDeliverables, setSubDeliverables] = useState({})

    const [workingOn, setWorkingOn] = useState("deliverables")
    const [deliverableRows, setDeliverableRows] = useState([])
    const deliverableColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Deliverable', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
    ];
    const subDeliverablesColumns : GridColDef = [
        { field: 'id', headerName: 'ID', width: 70 },
        {field: 'under', headerName: 'Connected to', width: 200},
        { field: 'name', headerName: 'Sub-deliverable', width: 200 },
        { field: 'description', headerName: 'Description', width: 220 },
    ];
    const [subDeliverableRows, setSubDeliverableRows] = useState([])
    const navigateToWorkPackages = () => {
        return (
            navigate("/work-packages", {state: {
                    "deliverables": deliverables,
                    "subDeliverables" : subDeliverables,
                    "projectGoal": projectGoal
                }})
        )
    }
    return (
        <div className="deliverables__grid">
            <div className={"deliverables__grid_left"}>
                {projectGoal === undefined && <ProjectGoal onContinue={setProjectGoal} changeHandler={changeHandler}/>}
                {projectGoal !== undefined && <div>
                    <Typography className={"general__inner_element"} variant={"h4"}>{projectGoal}</Typography>
                    {workingOn === "deliverables" && <Deliverables
                        setWorkingOn={setWorkingOn}
                        setDeliverableRows={setDeliverableRows}
                        setDeliverables={setDeliverables}
                    />}

                    {workingOn === "subDeliverables" && userState.layers === "2" && <SubDeliverables
                        deliverableRows={deliverableRows}
                        setWorkingOn={setWorkingOn}
                        setSubDeliverableRows={setSubDeliverableRows}
                        setSubDeliverables={setSubDeliverables}
                        navigateToWorkPackages={navigateToWorkPackages}
                    />}
                    {workingOn === "subDeliverables" && userState.layers === "1" && navigateToWorkPackages()}
                </div>}
            </div>

            <div className={"deliverables__grid_right"}>
                <Typography className={"general__inner_element"} variant={"h5"}>Deliverables</Typography>
                <div className={"deliverables__tables"}>
                    <DataGrid
                        rows={deliverableRows}
                        columns={deliverableColumns}
                    />
                </div>
                {userState.layers === "2" && <div>
                    <Typography className={"general__inner_element"} variant={"h5"}>Sub-deliverables</Typography>
                    <div className={"deliverables__tables"}>
                        <DataGrid
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
    const [tempGoal, setTempGoal] = useState()
    return (
        <div>
            <Typography className={"general__inner_element"} variant={"h3"}>Project goal</Typography>
            <Typography className={"general__inner_element"} variant={"body1"}>Define your project goal</Typography>
            <TextInput
                className="general__text_input"
                name="projectGoal"
                onChange={(e) => setTempGoal(e.target.value)}
                label="Project goal"
            />
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
                onClick={() => props.onContinue(tempGoal)}
                label={"Continue"}
                color={"lightBlue"}
            />
        </div>
    )
}

function Deliverables(props){
    const addDeliverables = () => {
        if (state?.deliverable_name !== "" && state?.deliverable_desc !== ""){
            props.setDeliverables(prevState => {return {...prevState, [state.deliverable_name]: state.deliverable_desc}})
            props.setDeliverableRows(prevState => {return prevState.concat([{
                "id": ((prevState?.at(-1)?.id) ? prevState?.at(-1)?.id + 1 : 1),
                "name": state.deliverable_name,
                "description": state.deliverable_desc}])})
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
    const addSubDeliverables = () => {
        if (state?.sub_deliverable_name !== "" && state?.sub_deliverable_desc !== "" && state.connected_to !== ""){
            props.setSubDeliverables(prevState => {return {...prevState, [state.sub_deliverable_name]: state.sub_deliverable_desc}})
            props.setSubDeliverableRows(prevState => {return prevState.concat([{
                "id": ((prevState?.at(-1)?.id) ? prevState?.at(-1)?.id + 1 : 1),
                "name": state.sub_deliverable_name,
                "description": state.sub_deliverable_desc,
                "under": props.deliverableRows.at(index)?.name
            }])})
            setState(prevState => {
                return {...prevState, ["sub_deliverable_name"]: "" , ["sub_deliverable_desc"]: ""}
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
    const increment_index = (dir) => {
        if (dir === -1 && index === 0){setIndex(props.deliverableRows.length - 1)}
        else if (dir === 1 && index === props.deliverableRows.length - 1){setIndex(0)}
        else setIndex(index + dir)
    }

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



