import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const Loading = <div>Loading...</div>
const AccDetail = lazy(() => import("../users/pages/AccDetailPage.jsx"))

const AccRouter = () => {
    return [
        {
            path: "",
            element: <Navigate replace to="list" />
        },
        {
            path: ":accNo",
            element: <Suspense fallback={Loading}><AccDetail /></Suspense>
        },
    ]
}

export default AccRouter;