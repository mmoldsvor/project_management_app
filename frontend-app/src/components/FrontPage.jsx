import {Title} from "@mui/icons-material";
import {Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import Button from "./Button";
import {isLoggedIn} from "../authorization/authorization";

export default function FrontPage(){
    const navigate = useNavigate()
    const selected_project = localStorage.getItem("selected_project-id")
    return(
        <div>
        </div>
    )
}