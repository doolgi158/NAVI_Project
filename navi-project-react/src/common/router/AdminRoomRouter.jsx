import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AdminRoomList = lazy(() => import("../../admin/pages/room/AdminRoomListPage.jsx"))
const AdminRoomForm = lazy(() => import("../../admin/pages/room/AdminRoomFormPage.jsx"))

const AdminRoomRouter = () => {
    return [
        {
            path: "rooms",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminRoomList />
                    </ProtectedRoute>
                </Suspense>
            )
        },
        {
            path: "rooms/new/:accNo",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminRoomForm />
                    </ProtectedRoute>
                </Suspense>
            )
        },
        {
            path: "rooms/edit/:roomNo",
            element: (
                <Suspense fallback={<div></div>}>
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminRoomForm />
                    </ProtectedRoute>
                </Suspense>
            )
        }
    ];
};

export default AdminRoomRouter;