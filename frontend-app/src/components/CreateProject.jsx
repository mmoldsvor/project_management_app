import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {client} from "../components/App";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography} from "@mui/material";
import InfoDrawer from "./Drawer";

const Infotext = `The projects can be divided in different types by application[6]:
    • Restructuring projects/ change projects: People and work processes are in focus, such as introducing changes in the processes of a department
    • Information technology (IT) and software projects: related to technology, programming, software and computer fields
    • Construction projects: process of constructing, renovating, refurbishing, etc. a building, structure or infrastructure 
    • Product development projects: The deliverables are tangible and concrete, includes new product development, the optimization of existing products and procurement of standardized or customized products
    • Research projects and studies: The deliverables are conceptual ideas or reports that provides a basis for a decision making`

const deliverableText = `A project should be broken into smaller deliverables to help visualize the work, improve communication, and assign responsibilities, differentiate external and internal work and reduce the complexity of the project
Deliverable: a project is divided in different major components, each of these components is called a deliverable. These deliverables refer to all the outputs of the project (tangible and intangible) and it refers to any project-related output summited during any phase of the project [1].
Subdeliverable: supporting deliverable, they are smaller components of the project that can be seen as “part of” the main deliverables [2,3].
`


export default function CreateProject(){
    const navigate = useNavigate()
    const createProject = async () => {
        const data = JSON.stringify(state)
        const projectId = await client.createProject(data)
        localStorage.setItem("selected_project-id", projectId.id)
        navigate("/deliverables")
    }
    const [state, setState] = useState({
        "name": "",
        "description": "",
        "project_type": "",
        "deliverable_only": false
    })
    const changeHandler = (e) => {
        setState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }
    return (
        <div className={"general__outer_div"}>
            <Typography variant={"h5"}> Create project </Typography>
            <Typography className={"general__inner_element"} variant={"body1"}>Define your project goal</Typography>
            <TextInput
                label={"Project goal"}
                name="name"
                value={state.name}
                onChange={changeHandler}
            />
            <Typography className={"general__inner_element"} variant={"body1"}>Describe your project</Typography>
            <TextInput
                label={"Description"}
                className={"general__text_input__large"}
                name="description"
                value={state.description}
                onChange={changeHandler}
            />
            <Typography>What kind of project-type describes your project best?</Typography>
            <InfoDrawer
                info_text={Infotext}
                title={"Project type"}
            />
            <FormControl>
                <RadioGroup
                    onChange={changeHandler}
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue=""
                    name="project_type"
                >
                    <FormControlLabel value="construction" control={<Radio />} label="Construction" />
                    <FormControlLabel value="software" control={<Radio />} label="Information technology (IT) and software" />
                    <FormControlLabel value="restructering" control={<Radio />} label="Restructuring projects/change" />
                    <FormControlLabel value="development" control={<Radio />} label="Product development" />
                    <FormControlLabel value="research" control={<Radio />} label="Research projects and studies" />
                </RadioGroup>
            </FormControl>

            <Typography className={"general__inner_element"} variant={"body1"}>
                How many layers of deliverables do you want to divide your project into?
            </Typography>
            <InfoDrawer
                title={"Deliverables and subdeliverables"}
                info_text = {deliverableText}
            />
            <RadioGroup
                onChange={changeHandler}
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue={false}
                name="deliverable_only"
            >
                <FormControlLabel value={false} control={<Radio />} label="Deliverables and Sub-deliverables" />
                <FormControlLabel value={true} control={<Radio />} label="Only deliverables" />
            </RadioGroup>
            <Button
                label={"Create project"}
                onClick={(_) => createProject()}
            />
        </div>
    )
}