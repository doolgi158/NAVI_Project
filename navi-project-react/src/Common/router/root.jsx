import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";
import TravelRouter from "./TravelRouter.jsx";
import FlightRouter from "./FlightRouter.jsx";
import AdminRouter from "./AdminRouter.jsx";
import AccRouter from "./AccRouter.jsx";

const Loading = <div></div>
const UserMain = lazy(() => import("../../users/pages/UserMainPage.jsx"))
const Signup = lazy(() => import("../../users/pages/UserSignupPage.jsx"))
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