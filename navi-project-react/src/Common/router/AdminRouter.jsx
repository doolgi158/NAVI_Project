import { Suspense, lazy } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div>Loading....</div>
const AdminUsers = lazy(() => import("../../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"))

const AdminRouter = () => {
    return [     
    
         {
             path: "dashboard",
             element: (
                 <Suspense fallback={Loading}>
                     <ModalProvider>
                         <AdminDashboard />
                     </ModalProvider>
                 </Suspense>
             )
         },
         {
             path: "users",
             element: (
                 <Suspense fallback={Loading}>
                     <ModalProvider>
                         <AdminUsers />
                     </ModalProvider>
                 </Suspense>
             )
         },
         
    ]
}

export default AdminRouter;