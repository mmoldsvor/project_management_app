import {Title} from "@mui/icons-material";
import {Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import Button from "./Button";

export default function FrontPage(){
    const navigate = useNavigate()
    return(
        <div>
            <Title>
                Welcome to our planning application!
            </Title>
            <Typography>
                This is made to help students plan their projects, both in study and private life
            </Typography>
            <Button
                onClick={() => {navigate("example", {state: {prevPage : window.location.pathname}})}}
                label={"Start planning"}
            />
        </div>
    )
}