import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const Loading = <div></div>;

const DeliveryPage = lazy(() => import("../../users/pages/delivery/DeliveryPage.jsx"));
const DeliveryListPage = lazy(() => import("../../users/pages/delivery/DeliveryListPage.jsx"));
const DeliveryDetailPage = lazy(() => import("../../users/pages/delivery/DeliveryDetailPage.jsx"));

const DeliveryRouter = () => [
  {
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <DeliveryPage />
      </Suspense>
    ),
  },
  {
    path: "list",
    element: (
      <Suspense fallback={Loading}>
        <DeliveryListPage />
      </Suspense>
    ),
  },
  {
    path: "detail/:id",
    element: (
      <Suspense fallback={Loading}>
        <ProtectedRoute requiredRole="USER">
          <DeliveryDetailPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
];

export default DeliveryRouter;
