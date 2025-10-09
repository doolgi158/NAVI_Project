// src/routes/AccRouter.jsx
import { Suspense, lazy } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

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
          <ModalProvider>
            <AccList />
          </ModalProvider>
        </Suspense>
      ),
    },
    {
      path: ":accNo",
      element: (
        <Suspense fallback={Loading}>
          <ModalProvider>
            <AccDetail />
          </ModalProvider>
        </Suspense>
      ),
    },
    {
      path: ":accNo/:roomId/reserve",
      element: (
        <Suspense fallback={Loading}>
          <ModalProvider>
            <AccReserve />
          </ModalProvider>
        </Suspense>
      ),
    },
    {
      path: ":accNo/:roomId/payment",
      element: (
        <Suspense fallback={Loading}>
          <ModalProvider>
            <AccPayment />
          </ModalProvider>
        </Suspense>
      ),
    },
  ];
};

export default AccRouter;
