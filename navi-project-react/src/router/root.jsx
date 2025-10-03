import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import travelRouter from "./travelRouter"

const Loading = <div>Loading...</div>
const Main = lazy(() => import("../pages/MainPage.jsx"))
const Travel = lazy(() => import("../pages/TravelPage.jsx"))

const UserMain = lazy(() => import("../users/pages/UserMainPage.jsx"))
const Users = lazy(() => import("../users/pages/UsersPage.jsx"))
const AdminDashboard = lazy(() => import("../admin/pages/AdminDashboardPage.jsx"))

const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><UserMain /></Suspense>
    },
    {
        path: "travel",
        element: <Suspense fallback={Loading}><Travel /></Suspense>,
        children: travelRouter()
    },
    {
        path: "/adm/dashboard",
        element: <Suspense fallback={Loading}><AdminDashboard /></Suspense>
    },
    {
        path: "/adm/users",
        element: <Suspense fallback={Loading}><Users /></Suspense>
    }
]);

export default root;