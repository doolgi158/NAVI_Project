import { Suspense, lazy } from "react";

const Loading = <div></div>
const AdminUsers = lazy(() => import("../../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"))

const AdminRouter = () => {
    return [     
    
         {
             path: "dashboard",
             element: (
                 <Suspense fallback={Loading}>
                    <AdminDashboard />
                 </Suspense>
             )
         },
         {
             path: "users",
             element: (
                 <Suspense fallback={Loading}>
                    <AdminUsers />
                 </Suspense>
             )
         },
         
    ]
}

export default AdminRouter;