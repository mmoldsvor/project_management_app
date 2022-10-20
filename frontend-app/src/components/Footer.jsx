
import "../styles/Footer.scss"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Button, Typography, Column } from "@mui/material";

export default function Footer(){
    return (
        <div className={"footer"}>
            <div className={"footer__logo"}>
                Copyright <span>&#169;</span> Your Project Planner 2022
            </div>

            <div className={"footer__navn1"}>
                Made by: <br/>
                Grytdal, Jonas K. <br/>  
                Kvande, Sindre <br/>
                Mignot, Ines <br/>

            </div>

            <div className={"footer__navn"}>
                Moldsvor, Martin M. <br/>
                Orrem, Elias S. O.<br/>
                Solvang, Sofia A. V.
                  
            </div>
        </div>
    )
}