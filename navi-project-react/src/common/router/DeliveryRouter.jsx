// src/Common/router/DeliveryRouter.jsx
import { lazy, Suspense } from "react";
import { ModalProvider } from "../components/login/ModalProvider.jsx";

const Loading = <div></div>;

const DeliveryPage = lazy(() => import("../../users/pages/delivery/DeliveryPage.jsx"));
const DeliveryListPage = lazy(() => import("../../users/pages/delivery/DeliveryListPage.jsx"));
const DeliveryDetailPage = lazy(() => import("../../users/pages/delivery/DeliveryDetailPage.jsx"));

const DeliveryRouter = () => [
  {
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <ModalProvider>
          <DeliveryPage />
        </ModalProvider>
      </Suspense>
    ),
  },
  {
    path: "list",
    element: (
      <Suspense fallback={Loading}>
        <ModalProvider>
          <DeliveryListPage />
        </ModalProvider>
      </Suspense>
    ),
  },
  {
    path: "detail/:id",
    element: (
      <Suspense fallback={Loading}>
        <ModalProvider>
          <DeliveryDetailPage />
        </ModalProvider>
      </Suspense>
    ),
  },
];

export default DeliveryRouter;
