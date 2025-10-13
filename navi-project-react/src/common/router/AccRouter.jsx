// src/routes/AccRouter.jsx
import { Suspense, lazy } from "react";

const Loading = <div>Loading....</div>;
const AccList = lazy(() => import("../../users/pages/acc/AccListPage.jsx"));
const AccDetail = lazy(() => import("../../users/pages/acc/AccDetailPage.jsx"));
const AccReserve = lazy(() => import("../../users/pages/acc/AccReservationPage.jsx"));
const AccPayment = lazy(() => import("../../users/pages/acc/AccPaymentPage.jsx"));

const AccRouter = () => {
  return [
    {
      path: "",
      element: (
        <Suspense fallback={Loading}>
          <AccList />
        </Suspense>
      ),
    },
    {
      path: ":accId",
      element: (
        <Suspense fallback={Loading}>
          <AccDetail />
        </Suspense>
      ),
    },
    {
      path: ":accId/:roomId/reservation",
      element: (
        <Suspense fallback={Loading}>
          <AccReserve />
        </Suspense>
      ),
    },
    {
      path: ":accId/:roomId/payment",
      element: (
        <Suspense fallback={Loading}>
          <AccPayment />
        </Suspense>
      ),
    },
  ];
};

export default AccRouter;