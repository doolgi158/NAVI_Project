import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading...</div>
const UserMain = lazy(() => import("../users/pages/UserMainPage.jsx"))
const Users = lazy(() => import("../users/pages/UsersPage.jsx"))
const AdminDashboard = lazy(() => import("../admin/pages/AdminDashboardPage.jsx"))
const Flight = lazy(() => import("../users/pages/FlightPage.jsx"))
const FlightDetail = lazy(() => import("../users/pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../users/pages/FlightRsvInputPage.jsx"))

const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><UserMain /></Suspense>
    },
    {
        path: "/adm/dashboard",
        element: <Suspense fallback={Loading}><AdminDashboard /></Suspense>
    },
    {
        path: "/adm/users",
        element: <Suspense fallback={Loading}><Users /></Suspense>
    },
    {
        path: "/flight",
        element: <Suspense fallback={Loading}><Flight /></Suspense>
    },
    {
        path: "/flight/detail/:flightNo",
        element: <Suspense fallback={Loading}><FlightDetail /></Suspense>
    },
    {
        path: "/flight/reserve/:flightNo",
        element: <Suspense fallback={Loading}><FlightRsv /></Suspense>
    },
]);

export default root;