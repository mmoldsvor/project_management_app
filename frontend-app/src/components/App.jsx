import logo from '../logo.svg';
import '../App.css';
import {Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import InfoDrawer from "./Drawer";
import {BrowserRouter, Routes} from "react-router-dom";
import {AppRoutes} from "../routes/Routes";
import OurClient from "../client/client";
import Header from "./Header";
import Footer from "./Footer";
export const client =  new OurClient("http://ec2-16-170-232-148.eu-north-1.compute.amazonaws.com:80/")
// export const client =  new OurClient("http://localhost:5000")
export const globalVariables = {
    "baseUrl": window.location.origin
}
function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Header/>
            {AppRoutes}
            <Footer/>
        </BrowserRouter>
    </div>
  );
}

export default App;
