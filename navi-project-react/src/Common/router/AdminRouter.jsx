import { Suspense, lazy } from "react";

const Loading = <div>Loading....</div>
const AdminUsers = lazy(() => import("../../admin/pages/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"))
const AdminTravelList = lazy(() => import("../../admin/pages/travel/AdminTravelList.jsx"))
const AdminTravelForm  = lazy(() => import("../../admin/pages/travel/AdminTravelForm.jsx"))

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