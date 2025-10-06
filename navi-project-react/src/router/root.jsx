import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AccRouter from "./AccRouter.jsx";

const Loading = <div></div>
const TravelPage = lazy(() => import("../users/pages/TravelPage.jsx"))
const UserMain = lazy(() => import("../users/pages/UserMainPage.jsx"))
const AdminUsers = lazy(() => import("../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../admin/pages/AdminDashboardPage.jsx"))
const Flight = lazy(() => import("../users/pages/FlightPage.jsx"))
const FlightDetail = lazy(() => import("../users/pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../users/pages/FlightRsvInputPage.jsx"))
const Signup = lazy(() => import("../users/pages/UserSignupPage.jsx"))

/* 숙소 */
const AccList = lazy(() => import("../users/pages/AccListPage.jsx"))
const AccDetail = lazy(() => import("../users/pages/AccDetailPage.jsx"))


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
    },
    {
        path: "/travel",
        element: <Suspense fallback={Loading}><TravelPage /></Suspense>
    },
    {
        path: "/accommodations",
        element: <Suspense fallback={Loading}><AccList /></Suspense>,
    },
    {
        path: "/accommodations/:accNo", 
        element: <Suspense fallback={Loading}><AccDetail /></Suspense>,
    },
]);

export default root;