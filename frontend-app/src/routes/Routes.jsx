import {Route, Routes} from 'react-router-dom';
import App from "../components/App";
import FrontPage from "../components/FrontPage";
import ExampleApplication from "../components/ExampleComponent";

export const AppRoutes = (
    <Routes>
        <Route key="frontPage" path="/" element={<FrontPage />} />
        <Route key="example" path="/example" element={<ExampleApplication />} />
    </Routes>
);