import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminAccList = lazy(() => import("../../admin/pages/acc/AdminAccListPage.jsx"))
const AdminAccForm = lazy(() => import("../../admin/pages/acc/AdminAccFormPage.jsx"))

const AdminAccommodationRouter = () => {
    return [
        {
            path: "accommodations",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminAccList />
                    </ProtectedRoute>
                </Suspense>
            )
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
