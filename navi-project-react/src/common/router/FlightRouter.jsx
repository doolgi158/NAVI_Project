import { lazy, Suspense } from "react";

const Loading = <div></div>
const FlightDetail = lazy(() => import("../../users/pages/flight/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../../users/pages/flight/FlightRsvInputPage.jsx"))
const Flight = lazy(() => import("../../users/pages/flight/FlightPage.jsx"))

const FlightRouter = () => {
    return [
        {
        path: "",
        element: (
            <Suspense fallback={Loading}>
                <Flight />
            </Suspense>
        )
    },
    
    {
        path: "detail",
        element: (
            <Suspense fallback={Loading}>
                <FlightDetail />
            </Suspense>
        )
    },
    {
        path: "rsv/:flightNo",
        element: (
            <Suspense fallback={Loading}>
                <FlightRsv />
            </Suspense>
        )
    },
]}

export default FlightRouter;