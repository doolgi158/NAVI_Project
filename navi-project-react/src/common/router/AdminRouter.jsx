import { Suspense, lazy } from "react";

const AdminUsers = lazy(() => import("../../admin/pages/user/AdminUsersPage.jsx"))
const AdminDashboard = lazy(() => import("../../admin/pages/AdminDashboardPage.jsx"))
const AdminTravelList = lazy(() => import("../../admin/pages/travel/AdminTravelList.jsx"))
const AdminTravelForm = lazy(() => import("../../admin/pages/travel/AdminTravelForm.jsx"))
const AdminFlightList = lazy(() => import("../../admin/pages/flight/AdminFlightListPage.jsx"));
const AdminFlightForm = lazy(() => import("../../admin/pages/flight/AdminFlightFormPage.jsx"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute.jsx"))

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
                        <AdminTravelList  />
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
                        <AdminTravelForm  />
                    </ProtectedRoute>
                 </Suspense>
             )
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
    ]
}

export default AdminRouter;