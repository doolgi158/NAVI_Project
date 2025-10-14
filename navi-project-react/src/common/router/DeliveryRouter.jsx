// src/Common/router/DeliveryRouter.jsx
import { lazy, Suspense } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div></div>;

// ✅ 사용자 짐배송 페이지
const DeliveryPage = lazy(() => import("../../users/pages/delivery/DeliveryPage.jsx"));
const DeliveryResultPage = lazy(() => import("../../users/pages/delivery/DeliveryResultPage.jsx"));

/**
 * DeliveryRouter
 * /delivery  → 예약 입력 페이지
 * /delivery/result → 예약 완료 결과 페이지
 */
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
    path: "result",
    element: (
      <Suspense fallback={Loading}>
        <ModalProvider>
          <DeliveryResultPage />
        </ModalProvider>
      </Suspense>
    ),
  },
];

export default DeliveryRouter;
