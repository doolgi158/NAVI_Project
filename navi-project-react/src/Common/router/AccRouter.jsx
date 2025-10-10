import { Suspense, lazy } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div>Loading....</div>
const AccList = lazy(() => import("../../users/pages/accommodation/AccListPage.jsx"))
const AccDetail = lazy(() => import("../../users/pages/accommodation/AccDetailPage.jsx"))

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
        )
    },
    {
        path: ":accNo", 
        element: (
            <Suspense fallback={Loading}>
                <ModalProvider>
                    <AccDetail />
                </ModalProvider>
            </Suspense>
        )
    },
    ]
}

export default AccRouter;
