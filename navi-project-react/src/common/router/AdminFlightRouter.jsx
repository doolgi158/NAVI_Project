import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
const AdminFlightRoot = lazy(() => import("../../admin/pages/flight/AdminFlightRoot"));
const AdminFlightListPage = lazy(() => import("../../admin/pages/flight/AdminFlightListPage"));
const AdminFlightFormPage = lazy(() => import("../../admin/pages/flight/AdminFlightFormPage"));
const AdminAirportPage = lazy(() => import("../../admin/pages/flight/AdminAirportPage"));
const AdminSeatPage = lazy(() => import("../../admin/pages/flight/AdminSeatPage"));
const AdminReservationPage = lazy(() => import("../../admin/pages/flight/AdminReservationPage"));

const AdminFlightRouter = () => [
    {
        path: "flight/*",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute requiredRole="ADMIN">
                    <AdminFlightRoot />
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            { index: true, element: <AdminFlightListPage /> },
            { path: "list", element: <AdminFlightListPage /> },
            { path: "new", element: <AdminFlightFormPage /> },
            { path: "edit/:flightId/:depTime", element: <AdminFlightFormPage /> },
            { path: "airports", element: <AdminAirportPage /> },
            { path: "seats", element: <AdminSeatPage /> },
            { path: "reservations", element: <AdminReservationPage /> },
        ],
    },

];

export default AdminFlightRouter;
