import { lazy, Suspense } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

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
                <ModalProvider>
                    <Flight />
                </ModalProvider>
            </Suspense>
        )
    },
    
    {
        path: "detail",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <FlightDetail />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "rsv/:flightNo",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <FlightRsv />
                </ModalProvider>
            </Suspense>
        )
    },
]}

export default FlightRouter;
