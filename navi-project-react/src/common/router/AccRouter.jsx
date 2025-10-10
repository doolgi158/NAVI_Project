import { Suspense, lazy } from "react";

const Loading = <div>Loading....</div>
const AccList = lazy(() => import("../../users/pages/accommodation/AccListPage.jsx"))
const AccDetail = lazy(() => import("../../users/pages/accommodation/AccDetailPage.jsx"))

const AccRouter = () => {
    return [
        {
        path: "",
        element: (
            <Suspense fallback={Loading}>
                <AccList />
            </Suspense>
        )
    },
    {
        path: ":accNo", 
        element: (
            <Suspense fallback={Loading}>
                <AccDetail />
            </Suspense>
        )
    },
    ]
}

export default AccRouter;
