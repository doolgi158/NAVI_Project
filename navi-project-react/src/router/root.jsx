import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ModalProvider } from "../common/component/ModalProvider.jsx";

const Loading = <div></div>
const TravelPage = lazy(() => import("../users/pages/TravelPage.jsx"))
const UserMain = lazy(() => import("../users/pages/UserMainPage.jsx"))
const AdminUsers = lazy(() => import("../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../admin/pages/AdminDashboardPage.jsx"))
const Flight = lazy(() => import("../users/pages/FlightPage.jsx"))
const FlightDetail = lazy(() => import("../users/pages/FlightDetailPage.jsx"))
const FlightRsv = lazy(() => import("../users/pages/FlightRsvInputPage.jsx"))
const Signup = lazy(() => import("../users/pages/UserSignupPage.jsx"))

const root = createBrowserRouter([
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
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <Flight />
                </ModalProvider>
            </Suspense>
        )
    },
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
        path: "/travel",
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <TravelPage />
                </ModalProvider>
            </Suspense>
        )
    },
]);

export default root;