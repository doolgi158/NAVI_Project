import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";

const AdminPaymentRoot = lazy(() => import("../../admin/pages/payment/AdminPaymentRoot"));
const AdminPaymentListPage = lazy(() => import("../../admin/pages/payment/AdminPaymentListPage"));

const AdminPaymentRouter = () => [
    {
        path: "payments",
        element: (
            <Suspense fallback={ <div>Loading...</div >}>
                <ProtectedRoute requiredRole="ADMIN">
                    <AdminPaymentRoot />
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            { index: true, element: <AdminPaymentListPage /> },
            { path: "list", element: <AdminPaymentListPage /> },
        ],
    },

];

export default AdminPaymentRouter;
