import * as React from 'react';
import BackpackIcon from '@mui/icons-material/Backpack';
import "../styles/NavigationDrawer.scss"
import {useState} from "react";
import {Typography} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import FunctionsIcon from '@mui/icons-material/Functions';
import {useNavigate} from "react-router-dom";
import {isLoggedIn} from "../authorization/authorization";

export default function NavigationDrawer(props) {
    const navigate = useNavigate()
    return (
        <div>
            <br/>
            <div className={"navigaton_drawer__inner_container"} onClick={() => navigate("/deliverables")}>
                <DeliveryDiningIcon
                    sx={{ fontSize: 30 }}
                />
                {props.isOpen && <Typography className={"navigaton_drawer__inner_text"}>
                    Deliverables
                </Typography>}
            </div>
            <div className={"navigaton_drawer__inner_container"} onClick={() => navigate("/work-packages")}>
                <BackpackIcon
                    sx={{ fontSize: 30 }}
                />
                {props.isOpen && <Typography className={"navigaton_drawer__inner_text"}>
                    Workpackages
                </Typography>}
            </div>
            <div className={"navigaton_drawer__inner_container"} onClick={() => navigate("/time-planning")}>
                <AccessTimeIcon
                    sx={{ fontSize: 30 }}
                />
                {props.isOpen && <Typography className={"navigaton_drawer__inner_text"}>
                    Time-planning
                </Typography>}
            </div>
            <div className={"navigaton_drawer__inner_container"} onClick={() => navigate("/summary")}>
                <FunctionsIcon
                    sx={{ fontSize: 30 }}
                />
                {props.isOpen && <Typography className={"navigaton_drawer__inner_text"}>
                    Summary
                </Typography>}
            </div>
        </div>
    )
}
