import {Route, Routes} from 'react-router-dom';
import FrontPage from "../components/FrontPage";
import ExampleApplication from "../components/ExampleComponent";
import Header from "../components/Header";
import ProjectSuccess from "../components/ProjectSuccess";
import ProjectDeliverables from "../components/ProjectDeliverables";
import ProjectWorkpackages from "../components/ProjectWorkpackages";
import LoginPage from "../authorization/LoginPage";
import CreateUser from "../authorization/CreateUser";
import CreateProject from "../components/CreateProject";
import ProjectsOverview from "../components/ProjectsOverview";

export const AppRoutes = (
    <Routes>
        <Route key="frontPage" path="/" element={<FrontPage />} />
        <Route key="login" path="/login" element={<LoginPage/>} />
        <Route key="createUser" path="/create-user" element={<CreateUser/>} />
        <Route key="example" path="/example" element={<ExampleApplication />} />
        <Route key="header" path="/header" element={<Header />} />
        <Route key="success" path="/success" element={<ProjectSuccess />} />
        <Route key="deliverables" path="/deliverables" element={<ProjectDeliverables />}/>
        <Route key="work-packages" path="/work-packages" element={<ProjectWorkpackages/>} />
        <Route key="new-project" path="/new-project" element={<CreateProject/>} />
        <Route key="projects-overview" path="/projects" element={<ProjectsOverview/>} />
    </Routes>
);