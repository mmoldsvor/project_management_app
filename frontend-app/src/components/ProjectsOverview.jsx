import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {client} from "../components/App";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import "../styles/ProjectOverview.scss"
import "../styles/Genereal.scss"
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography} from "@mui/material";


export default function ProjectsOverview(){
    const navigate = useNavigate()
    const [projects, setProjects] = useState()
    useEffect(() => {
        loadProjects()
    }, [])
    const [projectCards, setProjectCards] = useState([])
    const loadProjects = async () => {
        const response = await client.fetchProjects()
        setProjects(_ => {return response.projects})
    }
    const [change, setChange] = useState(0)
    useEffect(() => {
        const tempProjects = projects?.map(project => {
            return (
                <div key={project.name} >
                    <ProjectCard
                        name={project.name}
                        description={project.description}
                        project_id={project.project_id}
                        setChange={setChange}
                    />
                </div>
            )
        })
        console.log(projects)
        setProjectCards(_ => {return tempProjects})
    }, [projects, change])

    return (
        <div className={"general__outer_div"}>
            <Typography variant={"h3"}>Your projects</Typography>
            {projectCards}
        </div>
    )
}

function ProjectCard(props){
    const navigate = useNavigate()
    const selectProject = (project_id) => {
        localStorage.setItem("selected_project-id", project_id)
        props.setChange(prev_state => prev_state + 1)
    }
    const className = (props.project_id === localStorage.getItem("selected_project-id")) ? "projectCard__selected" : "projectCard"
    return (
        <div className={className} onClick={() => selectProject(props.project_id)}>
            <div className={"projectCard__inner"}>
                <Typography variant={"h4"}>{props.name}</Typography>
                <Typography>{props.description}</Typography>
                <Button label="Deliverables" onClick={() => navigate("/deliverables")}/>
                <Button label="Workpackages" onClick={() => navigate("/work-packages")}/>
            </div>
        </div>
    )
}