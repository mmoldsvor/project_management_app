import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {client} from "../components/App";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography} from "@mui/material";


export default function CreateProject(){
    const navigate = useNavigate()
    const createProject = async () => {
        const data = JSON.stringify(state)
        const response = await client.createProject(data)
        console.log(response)
    }
    const [state, setState] = useState({
        "name": "",
        "description": "",
        "project_type": ""
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
            <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">What kind of project-type describes your project best?</FormLabel>
                <RadioGroup
                    onChange={changeHandler}
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue=""
                    name="project_type"
                >
                    <FormControlLabel value="construction" control={<Radio />} label="Construction" />
                    <FormControlLabel value="transformation" control={<Radio />} label="Transformation" />
                    <FormControlLabel value="RD" control={<Radio />} label="Research and development" />
                </RadioGroup>
            </FormControl>
            <Button
                label={"Create project"}
                onClick={(_) => createProject()}
            />
        </div>
    )
}