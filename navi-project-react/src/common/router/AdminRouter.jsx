import { Suspense, lazy } from "react";
import AdminTravelForm from "../../admin/pages/travel/AdminTravelForm.jsx";
import AdminTravelList from "../../admin/pages/travel/AdminTravelList.jsx"; 

const Loading = <div></div>
const AdminUsers = lazy(() => import("../../admin/pages/user/AdminUsersPage.jsx"))
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
          //travel 관리자 페이지 라우팅
         {
             path: "travel",
             element: (
                 <Suspense fallback={Loading}>
                    <AdminTravelList  />
                 </Suspense>
             )
         },
         //travel 등록 페이지 라우팅
         {
             path: "travel/register",
             element: (
                 <Suspense fallback={Loading}>
                    <AdminTravelForm />
                 </Suspense>
             )
         },
         //travel 수정 페이지 라우팅
         {
             path: "travel/edit/:travelId",
             element: (
                 <Suspense fallback={Loading}>
                    <AdminTravelForm  />
                 </Suspense>
             )
         },
    ]
}

export default AdminRouter;