import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminAccommodation from "./AdminAccommodationRouter.jsx"
import AdminFlightRouter from "./AdminFlightRouter.jsx";
import AdminDeliveryRouter from "./AdminDeliveryRouter.jsx";
import AdminRoomyRouter from "./AdminRoomRouter.jsx"
import ManagerRouter from "./ManagerRouter.jsx";
import AdminPaymentRouter from "./AdminPaymentRouter.jsx"
import AdminTravelRouter from "./AdminTravelRouter.jsx"
import AdminPlanRouter from "./AdminPlanRouter.jsx"

const AdminUsers = lazy(() => import("../../admin/pages/user/AdminUsersPage.jsx"));
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"));

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
    // 게시판 관리자
    {
      path: "manager",
      children: [...ManagerRouter()],
    },

    //여행지 관리자
    {
      path: "travel",
      children: [...AdminTravelRouter()]
    },
    //여행계획 관리자
    {
      path: "plan",
      children: [...AdminPlanRouter()]
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