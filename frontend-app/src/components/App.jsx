import logo from '../logo.svg';
import '../App.css';
import {Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import InfoDrawer from "./Drawer";
import {BrowserRouter, Routes} from "react-router-dom";
import {AppRoutes} from "../routes/Routes";
import OurClient from "../client/client";
export const client =  new OurClient("http://localhost:5000")
export const globalVariables = {
    "baseUrl": window.location.origin
}
function App() {
  return (
    <div className="App">
        <BrowserRouter>
            {AppRoutes}
        </BrowserRouter>
    </div>
  );
}

export default App;
