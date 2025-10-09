import { Suspense, lazy } from "react";

const Loading = <div></div>
const AccList = lazy(() => import("../../users/pages/acc/AccListPage.jsx"))
const AccDetail = lazy(() => import("../../users/pages/acc/AccDetailPage.jsx"))

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