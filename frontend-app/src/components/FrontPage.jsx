import {Title} from "@mui/icons-material";
import {Button, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import OurClient from "../client/client";

export default function FrontPage(){
    const navigate = useNavigate()
    const token = "......"
    return(
        <div>
            <Title>
                Welcome to our planning application!
            </Title>
            <Typography>
                This is made to help students plan their projects, both in study and private life
            </Typography>
            <Button
                variant={"contained"}
                onClick={() => {OurClient("").pingBackend(token).then(console.log)}}
                label={"Ping server"}
            />

        </div>
    )
}