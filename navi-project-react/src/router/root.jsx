import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import travelRouter from "./travelRouter"

const Loading = <div></div>
const Travel = lazy(() => import("../users/pages/TravelPage.jsx"))
const UserMain = lazy(() => import("../users/pages/UserMainPage.jsx"))
const AdminUsers = lazy(() => import("../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../admin/pages/AdminDashboardPage.jsx"))
const Flight = lazy(() => import("../users/pages/FlightPage.jsx"))
const FlightDetail = lazy(() => import("../users/pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../users/pages/FlightRsvInputPage.jsx"))
const Signup = lazy(() => import("../users/pages/UserSignupPage.jsx"))

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
        element: <Suspense fallback={Loading}><AdminUsers /></Suspense>
    },
    {
        path: "/flight",
        element: <Suspense fallback={Loading}><Flight /></Suspense>
    },
    {
        path: "/flight/detail",
        element: <Suspense fallback={Loading}><FlightDetail /></Suspense>
    },
    {
        path: "/flight/rsv/:flightNo",
        element: <Suspense fallback={Loading}><FlightRsv /></Suspense>
    },
    {
        path: "/signup",
        element: <Suspense fallback={Loading}><Signup /></Suspense>
    }
]);

export default root;