import { Suspense, lazy } from "react";
import ProtectedRoute from "@/common/router/ProtectedRoute.jsx";

const Loading = <div>Loading....</div>;
const AdminPlanlList = lazy(() => import("../../admin/pages/plan/AdminPlanList.jsx"));
const AdminPlanDetail = lazy(() => import("../../admin/pages/plan/AdminPlanDetail.jsx"));

const AdminPlanRouter = () => {
    return [
        //여행계획 관리자 페이지
        {
            path: "",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminPlanlList />
                    </ProtectedRoute>
                </Suspense>
            )
        },

        //여행계획 관리자 상세페이지
        {
            path: ":planId",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminPlanDetail />
                    </ProtectedRoute>
                </Suspense>
            )
        },
    ];
};

export default AdminPlanRouter;