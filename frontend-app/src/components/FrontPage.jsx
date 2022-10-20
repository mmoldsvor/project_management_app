import {Title} from "@mui/icons-material";
import {Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import OurClient from "../client/client";
import Button from "./Button";

export default function FrontPage(){
    const navigate = useNavigate()
    const data = {"email": "testing@email.com",
                    "password": "testing"}
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
                // onClick={() => {client.authenticate(JSON.stringify(data)).then(console.log)}}
                label={"Ping server"}
            />

        </div>
    )
}