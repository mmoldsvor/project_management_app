
import "../styles/Header.scss"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Typography } from "@mui/material";
import blue_logo from '../blue_logo.png';
import {isLoggedIn} from "../authorization/authorization";
import Button from "./Button";
import {useNavigate} from "react-router-dom";
import Select from "react-select";
import {client} from "./App";
import {useEffect, useState} from "react";


export default function Header(){
    const loggedIn = isLoggedIn()
    const navigate = useNavigate()
    const selected_project = localStorage.getItem("selected_project-id")

    const [projectOptions, setProjectOptions] = useState([])

    const getProjects = async () => {
        const projectInfo = await client.fetchProjects()
        const tempProjects = []
        projectInfo?.projects.forEach(project => {
            tempProjects.push({value: project.project_id, label: project.name})
        })
        tempProjects.push({value: "", label: "Create new project"})
        setProjectOptions(tempProjects)
        console.log(tempProjects)
        if (tempProjects.length === 0){
            navigate("/new-project")
        }
    }
    const [currentProject, setCurrentProject] = useState({})
    const chosenProject = () => {
        const chosenProject = projectOptions.find(project => project.value === selected_project)
        setCurrentProject(chosenProject)
    }

    useEffect(() => {
        chosenProject()
    }, [projectOptions])
    useEffect(() => {
        getProjects()
    }, [window.location, window.location.pathname, loggedIn])
    return (
        <div className={"header"}>
            <div>
                <section className="header__logo" id="html" onClick={() => navigate("/")}>
                    <img style={{height: 50}} src={blue_logo} />
                </section>
            </div>
            <div className={"header__login_loggedin"}>
                {loggedIn && <AccountCircleIcon
                    className={"header__loggedin"}
                    onClick={() => navigate("/summary")}
                    sx={{ fontSize: 40 }}/>
                }
                {!loggedIn && <Button
                    className="header__login"
                    onClick={() => navigate("/login")}
                    label="Log in"
                    color={"rgb(199, 199, 255)"}
                />}
            </div>
            {loggedIn && <div className={"header__deliverables"}>
                <Select
                    className={"header__select"}
                    value={currentProject}
                    onChange={e => {
                        if (e.value === ""){
                            navigate("/new-project")
                        }
                        else {
                            if (selected_project === "" && e.value !== "") {
                                navigate("/")
                            }
                        }
                        localStorage.setItem("selected_project-id", e.value)
                        setCurrentProject(e)
                    }}
                    options={projectOptions}
                />
            </div>}
        </div>
    )
}