
import "../styles/Footer.scss"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Button, Typography, Column } from "@mui/material";

export default function Footer(){
    return (
        <div className={"footer"}>
            <div className={"footer__logo"}>
                Copyright <span>&#169;</span> Your Project Planner 2022
            </div>
            <Typography className={"footer__navn"}>
                {/*Grytdal, Jonas K. - Kvande, Sindre - Mignot, Ines - Moldsvor, Martin M. - Orrem, Elias S. O. - Solvang, Sofia A. V.*/}
                Grytdal, Kvande, Mignot, Moldsvor, Orrem, Solvang
            </Typography>

        </div>
    )
}