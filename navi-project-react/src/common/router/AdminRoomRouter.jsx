// src/common/router/AdminRoomRouter.jsx
import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminRoomRoot = lazy(() => import("../../admin/pages/room/AdminRoomRoot.jsx"));
const AdminRoomListPage = lazy(() => import("../../admin/pages/room/AdminRoomListPage.jsx"));
//const AdminRoomStockListPage = lazy(() => import("../../admin/pages/room/AdminRoomStockListPage.jsx"));
//const AdminRoomFormPage = lazy(() => import("../../admin/pages/room/AdminRoomFormPage.jsx"));

/* ==========================================================
   [AdminRoomRouter]
   - 객실 관리 라우터
   - Outlet 기반: 상단 Header 유지 + 하위 페이지 교체
========================================================== */
const AdminRoomRouter = () => {
  return [
    {
      path: "rooms",
      element: (
        <Suspense fallback={<div></div>}>
          <ProtectedRoute requiredRole="ADMIN">
            <AdminRoomRoot />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        { index: true, element: <AdminRoomListPage /> },
        { path: "list", element: <AdminRoomListPage /> },
        //{ path: "stocks", element: <AdminRoomStockListPage /> },
        //{ path: "new/:accNo", element: <AdminRoomFormPage /> },
        //{ path: "edit/:roomNo", element: <AdminRoomFormPage /> },
      ],
    },
  ];
};

export default AdminRoomRouter;
