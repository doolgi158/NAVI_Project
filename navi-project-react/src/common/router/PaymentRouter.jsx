// src/routes/PaymentRouter.jsx
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;
const PaymentPage = lazy(() => import("../../users/pages/payment/PaymentPage.jsx"));
const PaymentResultPage = lazy(() => import("../../users/pages/payment/PaymentResultPage.jsx"));

const PaymentRouter = () => [
  {
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <PaymentPage />
      </Suspense>
    ),
  },
  {
    path: "result",
    element: (
      <Suspense fallback={Loading}>
        <PaymentResultPage />
      </Suspense>
    ),
  },
];

export default PaymentRouter;
