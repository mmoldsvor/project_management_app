import {Route, Routes} from 'react-router-dom';
import App from "../components/App";
import FrontPage from "../components/FrontPage";
import ExampleApplication from "../components/ExampleComponent";
import Header from "../components/Header";
import ProjectSuccess from "../components/ProjectSuccess";

export const AppRoutes = (
    <Routes>
        <Route key="frontPage" path="/" element={<FrontPage />} />
        <Route key="example" path="/example" element={<ExampleApplication />} />
        <Route key="header" path="/header" element={<Header />} />
        <Route key="success" path="/success" element={<ProjectSuccess />} />
    </Routes>
);