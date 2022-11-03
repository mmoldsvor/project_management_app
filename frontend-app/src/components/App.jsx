import '../App.css';
import {HashRouter, useLocation} from "react-router-dom";
import {AppRoutes} from "../routes/Routes";
import OurClient from "../client/client";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/Genereal.scss"
import PermanentDrawerLeft from "./NavigationDrawer";
import NavigationDrawer from "./NavigationDrawer";
import {useEffect, useState} from "react";

export const client =  new OurClient("https://api.yourprojectplanner.help")
// export const client =  new OurClient("http://localhost:5000")
export const globalVariables = {
    "baseUrl": window.location.origin
}



function App() {
    const [isOpen, setIsOpen] = useState(false)
    const [showNavigation, setShowNavigaton] = useState(true)
    let url = window.location.href;
    document.body.addEventListener('click', ()=>{
        requestAnimationFrame(()=>{
            if(url!==window.location.href){
                url = window.location.href
                setShowNavigaton(_ => (localStorage.getItem("selected_project-id") !== "" && localStorage.getItem("selected_project-id") !== null))
            }
        });
    }, true);

    return (
    <div className="App">
        <HashRouter>
            <Header/>
            <div className="container">
                <aside style={{"width": "60px", "background": "white", "height": "100%"}}>
                    {showNavigation && <div
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                        className={(isOpen) ? "navigaton_drawer__div_open" : "navigaton_drawer__div_closed"}
                    >
                         <NavigationDrawer
                            isOpen={isOpen}
                        />
                    </div>}

                </aside>
                <main className="main">{AppRoutes}</main>
            </div>
            <Footer/>
        </HashRouter>
    </div>
  );
}

export default App;
