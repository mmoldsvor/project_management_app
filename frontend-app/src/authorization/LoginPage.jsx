import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {client, globalVariables} from "../components/App";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import {isLoggedIn, setToken} from "./authorization";
import {Typography} from "@mui/material";



export default function LoginPage(){
    const navigate = useNavigate()

    const login = async () => {
        const data = JSON.stringify(state)
        const token = await client.authenticate(data)
        if (token?.token === undefined) {
            setBadLogin(true)
        } else {
            setBadLogin(false)
            setToken(token.token)
            navigate("/")
        }
    }
    const [state, setState] = useState({
        "email": "",
        "password": ""
    })
    const [badLogin, setBadLogin] = useState(false)
    const changeHandler = (e) => {
        setState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }
    useEffect(() => {
        if(isLoggedIn()){navigate("/")}
    }, [])

    return (
        <div className={"general__outer_div"}>
            {badLogin && <Typography>
                Password or email incorrect
            </Typography>}
            <TextInput
                label={"Email"}
                name="email"
                value={state.email}
                onChange={changeHandler}
            />
            <TextInput
                label={"Password"}
                type={"password"}
                name="password"
                value={state.password}
                onChange={changeHandler}
                onKeyDown={(e) => {if(e.key ==="Enter"){login()}}}
            />
            <Button
                label={"Login"}
                color={"lightblue"}
                onClick={(_) => login()}
            />
            <Button
                color={"white"}
                label={"Create user"}
                onClick={(_) => navigate("/create-user")}
            />
        </div>
    )
}