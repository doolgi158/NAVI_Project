import { Suspense, lazy } from "react";
import ProtectedRoute from "@/common/router/ProtectedRoute.jsx";

const Loading = <div>Loading....</div>;
const AdminTravelList = lazy(() => import("../../admin/pages/travel/AdminTravelList.jsx"));
const AdminTravelDetail = lazy(() => import("../../admin/pages/travel/AdminTravelDetail.jsx"));
const AdminTravelForm = lazy(() => import("../../admin/pages/travel/AdminTravelForm.jsx"));

const AdminTravelRouter = () => {
    return [
        //travel 관리자 페이지 라우팅
        {
            path: "",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminTravelList />
                    </ProtectedRoute>
                </Suspense>
            )
        },
        //travel 관리자 상세 페이지 라우팅
        {
            path: "detail/:travelId",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminTravelDetail />
                    </ProtectedRoute>
                </Suspense>
            )
        },

        //travel 등록 페이지 라우팅
        {
            path: "register",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminTravelForm />
                    </ProtectedRoute>
                </Suspense>
            )
        },

        //travel 수정 페이지 라우팅
        {
            path: "edit/:travelId",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminTravelForm />
                    </ProtectedRoute>
                </Suspense>
            ),
        },

    ];
};

export default AdminTravelRouter;