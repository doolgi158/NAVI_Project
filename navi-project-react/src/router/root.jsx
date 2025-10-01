import React from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading...</div>
const Main = lazy(() => import("../pages/MainPage.jsx"))
const Travel = lazy(() => import("../pages/TravelPage.jsx"))
const Flight = lazy(() => import("../pages/FlightPage.jsx"))
const FlightDetail = lazy(() => import("../pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../pages/FlightRsvInputPage.jsx"))

const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><Main /></Suspense>
    },
    {
        path: "travel",
        element: <Suspense fallback={Loading}><Travel /></Suspense>
    },
    {
        path: "flight",
        element: <Suspense fallback={Loading}><Flight /></Suspense>
    },
    {
        path: "flight/:id",
        element: <Suspense fallback={Loading}><FlightDetail /></Suspense>
    },
    {
        path: "flight/:id/rsv",
        element: <Suspense fallback={Loading}><FlightRsv /></Suspense>
    },
]);

export default root;