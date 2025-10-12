import { Suspense, lazy } from "react";

const Loading = <div></div>;
const AdminUsers = lazy(() => import("../../admin/pages/user/AdminUsersPage.jsx"));
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"));
const AdminFlightList = lazy(() => import("../../admin/pages/flight/AdminFlightListPage.jsx"));
const AdminFlightForm = lazy(() => import("../../admin/pages/flight/AdminFlightFormPage.jsx"));

const AdminRouter = () => {
  return [
    {
      path: "dashboard",
      element: (
        <Suspense fallback={Loading}>
          <AdminDashboard />
        </Suspense>
      ),
    },
    {
      path: "users",
      element: (
        <Suspense fallback={Loading}>
          <AdminUsers />
        </Suspense>
      ),
    },
    {
      path: "flight", // 항공편 목록 페이지
      element: (
        <Suspense fallback={Loading}>
          <AdminFlightList />
        </Suspense>
      ),
    },
    {
      path: "flight/new", // 항공편 등록 페이지
      element: (
        <Suspense fallback={Loading}>
          <AdminFlightForm />
        </Suspense>
      ),
    },
    {
      path: "flight/edit/:flightId/:depTime", // 항공편 수정 페이지
      element: (
        <Suspense fallback={Loading}>
          <AdminFlightForm />
        </Suspense>
      ),
    },
  ];
};

export default AdminRouter;
