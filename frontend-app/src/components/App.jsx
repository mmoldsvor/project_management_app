import '../App.css';
import {HashRouter} from "react-router-dom";
import {AppRoutes} from "../routes/Routes";
import OurClient from "../client/client";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/Genereal.scss"
import PermanentDrawerLeft from "./NavigationDrawer";
import NavigationDrawer from "./NavigationDrawer";
import {useState} from "react";

export const client =  new OurClient("https://api.yourprojectplanner.help")
// export const client =  new OurClient("http://localhost:5000")
export const globalVariables = {
    "baseUrl": window.location.origin
}
function App() {
    const [isOpen, setIsOpen] = useState(false)
    return (
    <div className="App">
        <HashRouter>
            <Header/>
            <div className="container">
                <aside className={(isOpen) ? "navigaton_drawer__div_open" : "navigaton_drawer__div_closed"}
                       onMouseEnter={() => setIsOpen(true)}
                       onMouseLeave={() => setIsOpen(false)}
                >
                    <NavigationDrawer
                        isOpen={isOpen}
                    />
                </aside>
                <main className="main">{AppRoutes}</main>
            </div>
            <Footer/>
        </HashRouter>
    </div>
  );
}

export default App;
