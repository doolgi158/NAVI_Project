import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import TravelRouter from "./TravelRouter.jsx";
import PlanRouter from "./PlanRouter.jsx";
import FlightRouter from "./FlightRouter.jsx";
import AdminRouter from "./AdminRouter.jsx";
import AccRouter from "./AccRouter.jsx";
import UserRouter from "./UserRouter.jsx";
import DeliveryRouter from "./DeliveryRouter.jsx"
import PaymentRouter from "./PaymentRouter.jsx";
import BoardRouter from "./BoardRouter.jsx";


const Loading = <div></div>
const Main = lazy(() => import("../../users/pages/UserMainPage.jsx"))
const Appshell = lazy(() => import("../../Appshell.jsx"))

const root = createBrowserRouter([
    {
        element: <Suspense fallback={Loading}> <Appshell /> </Suspense>,
        children: [
            {
                path: "*",
                element: <Suspense fallback={Loading}><Main /></Suspense>
            },
            {
                path: "/",
                element: <Suspense fallback={Loading}><Main /></Suspense>
            },
            {
                path: "/travel",
                children: [...TravelRouter()]
            },
            {
                path: "/plans",
                children: [...PlanRouter()]
            },
            {
                path: "/flight",
                children: [...FlightRouter()]
            },
            {
                path: "/adm",
                children: [...AdminRouter()]
            },
            {
                path: "/accommodations",
                children: [...AccRouter()]
            },
            {
                path: "/delivery",
                children: [...DeliveryRouter()]
            },
            {
                path: "/users",
                children: [...UserRouter()]
            },
            {
                path: "/payments",
                children: [...PaymentRouter()]
            },
            {
                path: "/board",
                children: [...BoardRouter()]
            },
        ]
    }
]);

export default root;