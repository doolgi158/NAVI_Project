import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";
import TravelRouter from "./TravelRouter.jsx";
import FlightRouter from "./FlightRouter.jsx"

const Loading = <div></div>
const UserMain = lazy(() => import("../../users/pages/UserMainPage.jsx"))
const AdminUsers = lazy(() => import("../../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"))
const Signup = lazy(() => import("../../users/pages/UserSignupPage.jsx"))
const AccList = lazy(() => import("../../users/pages/acc/AccListPage.jsx"))
const AccDetail = lazy(() => import("../../users/pages/acc/AccDetailPage.jsx"))
const Redirect = lazy(() => import("../../users/pages/RedirectPage.jsx"))

const root = createBrowserRouter([
    {
        path: "/travel",
        children: [...TravelRouter()]
    },
    {
        path: "/flight",
       children: [...FlightRouter()]
    },
    {
        path:"/adm",
        children: [...AdminRouter()]
    },
    {
        path:"/accommodations",
        children:[...AccRouter()]
    },    
    {
        path: "/",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <UserMain />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "/adm/dashboard",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <AdminDashboard />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "/adm/users",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <AdminUsers />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "/flight",
        children: [...FlightRouter()]
    },
    {
        path: "/signup",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <Signup />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "/login/oauth2/redirect",
        element: <Suspense fallback={Loading}><Redirect /> </Suspense>
    },
    
]);

export default root;