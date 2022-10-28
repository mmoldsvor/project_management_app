import '../App.css';
import {HashRouter} from "react-router-dom";
import {AppRoutes} from "../routes/Routes";
import OurClient from "../client/client";
import Header from "./Header";
import Footer from "./Footer";

export const client =  new OurClient("https://api.yourprojectplanner.help")
// export const client =  new OurClient("http://localhost:5000")
export const globalVariables = {
    "baseUrl": window.location.origin
}
function App() {
  return (
    <div className="App">
        <HashRouter>
            <Header/>
            {AppRoutes}
            <Footer/>
        </HashRouter>
    </div>
  );
}

export default App;
