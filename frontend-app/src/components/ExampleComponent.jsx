import logo from '../logo.svg';
import '../App.css';
import {Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography} from "@mui/material";
import InfoDrawer from "./Drawer";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";

const info = `Work package: the work packages are a special form of components that have the following characteristics [4]:
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

export default function ExampleApplication() {
    const {state} = useLocation()
    const navigate = useNavigate()
    const [userState, setUserState] = useState({
        projectType: undefined,
        startDate: undefined,

    })

    const changeHandler = (e) => {
        setUserState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }

    return (
        <div className="App">
            <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">What kind of project-type describes your project best?</FormLabel>
                <RadioGroup
                    onChange={changeHandler}
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="construction"
                    name="projectType"
                >
                    <FormControlLabel value="construction" control={<Radio />} label="Construction" />
                    <FormControlLabel value="transformation" control={<Radio />} label="Transformation" />
                    <FormControlLabel value="RD" control={<Radio />} label="Research and development" />
                </RadioGroup>
            </FormControl>
            <div className={"infoGrid"}>
                <Typography>
                    Test
                </Typography>
                <InfoDrawer
                    title={"Project type"}
                    info_text = {info}
                />
            </div>
            <Button
                variant="contained"
                onClick={() => console.log(userState)}
            >
                Continue
            </Button>
            <Button
                variant="outlined"
                color={"secondary"}
                onClick={() => {
                    console.log(state)
                    navigate(state?.prevPage)
                }}
            >
                Back
            </Button>
        </div>
    );
}

