
import "../styles/Header.scss"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Button, Typography } from "@mui/material";
import blue_logo from '../blue_logo.png';


export default function Header(){
    const loggedIn = false
    return (
        <div className={"header"}>
            <div>
                <section className="header__logo" id="html">
                    <img style={{height: 80}} src={blue_logo} />
                </section>
            </div>
            <div className={"header__login_loggedin"}>
                {loggedIn && <AccountCircleIcon className={"header__loggedin"} sx={{ fontSize: 70 }}/>}
                {!loggedIn && <Typography className="header__login" variant="body1">Log in</Typography>}
            </div>
            <div className={"header__start"}>
                {loggedIn &&
                    <button className='header__button'> New Project </button>
                    }
                {!loggedIn && 
                <button className='header__button'> Get Started </button>
                }
                
            </div>
        </div>
    )
}