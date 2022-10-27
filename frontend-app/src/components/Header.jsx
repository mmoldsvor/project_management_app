
import "../styles/Header.scss"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Typography } from "@mui/material";
import blue_logo from '../blue_logo.png';
import {isLoggedIn} from "../authorization/authorization";
import Button from "./Button";
import {useNavigate} from "react-router-dom";


export default function Header(){
    const loggedIn = isLoggedIn()
    const navigate = useNavigate()
    const selected_project = localStorage.getItem("selected_project-id")
    return (
        <div className={"header"}>
            <div>
                <section className="header__logo" id="html" onClick={() => navigate("/")}>
                    <img style={{height: 80}} src={blue_logo} />
                </section>
            </div>
            <div className={"header__login_loggedin"}>
                {loggedIn && <AccountCircleIcon
                    className={"header__loggedin"}
                    onClick={() => navigate("/projects")}
                    sx={{ fontSize: 70 }}/>
                }
                {!loggedIn && <Button
                    className="header__login"
                    onClick={() => navigate("/login")}
                    label="Log in"
                    color={"orange"}
                />}
            </div>
            {loggedIn && <div className={"header__deliverables"}>
                {selected_project === null && <Button className={"header__button"} label={"Projects"} onClick={() => navigate("/projects")}/>}
                {selected_project !== null && <Button className={"header__button"} label={"Deliverables"} onClick={() => navigate("/deliverables")}/>}
                {selected_project !== null && <Button className={"header__button"} label={"Work-packages"} onClick={() => navigate("/work-packages")}/>}
                {selected_project !== null &&  <Button className={"header__button"} label={"Time-planning"} onClick={() => navigate("/time-planning")}/>}
                {selected_project !== null && <Button
                    className='header__button'
                    label={"New Project"}
                    onClick={() => navigate("/new-project")}
                    />}
            </div>}
            {/*<div className={"header__start"}>*/}
            {/*    {!loggedIn && <Button*/}
            {/*        className='header__button'*/}
            {/*        label={"Get Started"}*/}
            {/*        onClick={() => navigate("/login")}*/}
            {/*    />}*/}
            {/*</div>*/}


        </div>
    )
}