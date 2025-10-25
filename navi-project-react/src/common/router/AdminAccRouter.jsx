import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminAccRoot = lazy(() => import("../../admin/pages/acc/AdminAccRoot.jsx"));
const AdminAccListPage = lazy(() => import("../../admin/pages/acc/AdminAccListPage.jsx"))
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
            ],
        },
        {
            path: "accommodations/new",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminAccForm />
                    </ProtectedRoute>
                </Suspense>
            )
        },
        {
            path: "accommodations/edit/:accNo",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminAccForm />
                    </ProtectedRoute>
                </Suspense>
            )
        },
    ];
};

export default AdminAccommodationRouter;
