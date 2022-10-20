
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
                {/*<div className={"header__text"}> Hello </div>*/}
                <Button className={"header__button"} label={"Deliverables"} onClick={() => navigate("/deliverables")}/>
                <Button className={"header__button"} label={"Workpackages"} onClick={() => {}}/>
                <Button
                    className='header__button'
                    label={"New Project"}
                    onClick={() => navigate("/new-project")}
                />
            </div>}
            <div className={"header__mid"}/>
            <div className={"header__start"}>

                {!loggedIn && <Button
                    className='header__button'
                    label={"Get Started"}
                    onClick={() => navigate("/login")}
                />}
            </div>
        </div>
    )
}