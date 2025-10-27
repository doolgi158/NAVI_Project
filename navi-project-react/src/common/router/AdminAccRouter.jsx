import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminAccRoot = lazy(() => import("../../admin/pages/acc/AdminAccRoot.jsx"));
const AdminAccListPage = lazy(() => import("../../admin/pages/acc/AdminAccListPage.jsx"))
const AdminRoomRsvListPage = lazy(() => import("../../admin/pages/acc/AdminRoomRsvListPage.jsx"))
const AdminAccForm = lazy(() => import("../../admin/pages/acc/AdminAccFormPage.jsx"))

const AdminAccommodationRouter = () => {
    return [
        {
            path: "accommodations",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminAccRoot />
                    </ProtectedRoute>
                </Suspense>
            ),
            children: [
                { index: true, element: <AdminAccListPage /> },
                { path: "list", element: <AdminAccListPage /> },
                { path: "reservations", element: <AdminRoomRsvListPage /> },
                { path: "edit/:accNo", element: <AdminAccForm /> },
                { path: "new", element: <AdminAccForm /> },
            ],
        },
    ];
};

export default AdminAccommodationRouter;
