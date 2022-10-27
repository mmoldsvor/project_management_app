import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {client, globalVariables} from "../components/App";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import {isLoggedIn, setToken} from "./authorization";
import {Typography} from "@mui/material";



export default function CreateUser(){
    const navigate = useNavigate()
    const createUser = async () => {
        if (state.password !== duplicatePassword) {
            console.log("Not duplicate")
            return
        }
        const data = JSON.stringify(state)
        const response = await client.createUser(data)
        console.log((response))
        if (response?.message !== "User created"){return}
        const token = await client.authenticate(JSON.stringify({
            "email": state.email,
            "password": state.password
        }))
        setToken(token?.token)
        navigate("/")
    }
    const [state, setState] = useState({
        "email": "",
        "password": "",
        "name": ""
    })
    const [duplicatePassword, setDuplicatePassword] = useState("")
    const changeHandler = (e) => {
        setState(prevState => {
            return {...prevState, [e.target.name] : e.target.value}
        })
    }

    useEffect(() => {
        if (isLoggedIn()) {
            navigate("/")
        }
    }, [])

    return (
        <div className={"general__outer_div"}>
            <TextInput
                label={"Email"}
                name="email"
                value={state.email}
                onChange={changeHandler}
            />
            <TextInput
                label={"Password"}
                name="password"
                type={"password"}
                value={state.password}
                onChange={changeHandler}
            />
            <TextInput
                label={"Repeat password"}
                name="password_duplicate"
                type={"password"}
                value={duplicatePassword}
                onChange={(e) => setDuplicatePassword(e.target.value)}
                onKeyDown={(e) => {if(e.key ==="Enter"){createUser()}}}
            />
            <Button
                label={"Create user"}
                onClick={(_) => createUser()}
            />
        </div>
    )
}