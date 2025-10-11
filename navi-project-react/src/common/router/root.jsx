import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import TravelRouter from "./TravelRouter.jsx";
import FlightRouter from "./FlightRouter.jsx";
import AdminRouter from "./AdminRouter.jsx";
import AccRouter from "./AccRouter.jsx";
import UserRouter from "./UserRouter.jsx";
import DeliveryRouter from "./DeliveryRouter.jsx";

const Loding = <div></div>
const Main = lazy(() => import("../../users/pages/UserMainPage.jsx"))
const Appshell = lazy(() => import("../../Appshell.jsx"))

const root = createBrowserRouter([
    { 
        element: <Appshell />,
        children: [
    {
        path: "/",
        element: <Suspense fallback={Loding}><Main /></Suspense>
    },
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
        path: "/users",
        children: [...UserRouter()]
    },
    {
        path:"/delivery",
        children:[...DeliveryRouter()]
    },
]
}
]);

export default root;