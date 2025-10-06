import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div></div>
const FlightDetail = lazy(() => import("../../users/pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../../users/pages/FlightRsvInputPage.jsx"))

const root = createBrowserRouter([
    {
        path: "/flight/detail",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <FlightDetail />
                </ModalProvider>
            </Suspense>
        )
    },
    {
        path: "/flight/rsv/:flightNo",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <FlightRsv />
                </ModalProvider>
            </Suspense>
        )
    },
]);

export default root;
