import {Title} from "@mui/icons-material";
import {Button, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";

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
                variant={"contained"}
                onClick={() => {navigate("example", {state: {prevPage : window.location.pathname}})}}
            >
                Start planning
            </Button>
        </div>
    )
}