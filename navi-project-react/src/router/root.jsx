import React from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import travelRouter from "./travelRouter"

const Loading = <div>Loading...</div>
const Main = lazy(() => import("../pages/MainPage.jsx"))
const Travel = lazy(() => import("../pages/TravelPage.jsx"))


const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><Main /></Suspense>
    },
    {
        path: "travel",
        element: <Suspense fallback={Loading}><Travel /></Suspense>,
        children: travelRouter()
    },
    
]);

export default root;