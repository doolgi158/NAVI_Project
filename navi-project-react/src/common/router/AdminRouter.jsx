import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminAccommodation from "./AdminAccRouter.jsx"
import AdminFlightRouter from "./AdminFlightRouter.jsx";
import AdminDeliveryRouter from "./AdminDeliveryRouter.jsx";
import AdminRoomyRouter from "./AdminRoomRouter.jsx"
import ManagerRouter from "./ManagerRouter.jsx";
import AdminPaymentRouter from "./AdminPaymentRouter.jsx"

const AdminUsers = lazy(() => import("../../admin/pages/user/AdminUsersPage.jsx"));
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"));
const AdminTravelList = lazy(() => import("../../admin/pages/travel/AdminTravelList.jsx"));
const AdminTravelForm = lazy(() => import("../../admin/pages/travel/AdminTravelForm.jsx"));

const AdminRouter = () => {
  return [
    {
      path: "dashboard",
      element: (
        <Suspense fallback={<div></div>}>
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: "users",
      element: (
        <Suspense fallback={<div></div>}>
          <ProtectedRoute requiredRole="ADMIN">
            <AdminUsers />
          </ProtectedRoute>
        </Suspense>
      )
    },
    //travel 관리자 페이지 라우팅
    {
      path: "travel",
      element: (
        <Suspense fallback={<div></div>}>
          <ProtectedRoute requiredRole="ADMIN">
            <AdminTravelList />
          </ProtectedRoute>
        </Suspense>
      )
    },
    //travel 등록 페이지 라우팅
    {
      path: "travel/register",
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
      path: "travel/edit/:travelId",
      element: (
        <Suspense fallback={<div></div>}>
          <ProtectedRoute requiredRole="ADMIN">
            <AdminTravelForm />
          </ProtectedRoute>
        </Suspense>
      ),
    },

    // 게시판 관리자
    {
      path: "manager",
      children: [...ManagerRouter()],
    },

    // 항공 관리자 라우터 통합
    ...AdminFlightRouter(),

    // 숙소 라우터
    ...AdminAccommodation(),

    // 객실 라우터
    ...AdminRoomyRouter(),

    // 짐배송 라우터
    ...AdminDeliveryRouter(),

    // 결제 라우터
    ...AdminPaymentRouter(),
  ];
};

export default AdminRouter;