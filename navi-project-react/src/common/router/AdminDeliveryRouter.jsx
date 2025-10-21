import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminDeliveryRoot = lazy(() => import("../../admin/pages/delivery/AdminDeliveryRoot.jsx"));
const AdminBagPage = lazy(() => import("../../admin/pages/delivery/AdminBagPage.jsx"));
const AdminDeliveryGroupPage = lazy(() => import("../../admin/pages/delivery/AdminDeliveryGroupPage.jsx"));
const AdminDeliveryReservationPage = lazy(() => import("../../admin/pages/delivery/AdminDeliveryReservationPage.jsx"));

const AdminDeliveryRouter = () => {
    return [
        {
            path: "/adm/deliveries",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminDeliveryRoot />
                    </ProtectedRoute>
                </Suspense>
            ),
            children: [
                // ✅ 기본 진입 시 bags로 리다이렉트
                {
                    index: true,
                    element: (
                        <Suspense fallback={<div></div>}>
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminBagPage />
                            </ProtectedRoute>
                        </Suspense>
                    ),
                },
                {
                    path: "bags",
                    element: (
                        <Suspense fallback={<div></div>}>
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminBagPage />
                            </ProtectedRoute>
                        </Suspense>
                    ),
                },
                {
                    path: "groups",
                    element: (
                        <Suspense fallback={<div></div>}>
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminDeliveryGroupPage />
                            </ProtectedRoute>
                        </Suspense>
                    ),
                },
                {
                    path: "reservations",
                    element: (
                        <Suspense fallback={<div></div>}>
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminDeliveryReservationPage />
                            </ProtectedRoute>
                        </Suspense>
                    ),
                },
            ],
        },
    ];
};

export default AdminDeliveryRouter;
