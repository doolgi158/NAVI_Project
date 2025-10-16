import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;

const BoardList = lazy(() => import("../../boards/pages/BoardList.jsx"));
const BoardDetail = lazy(() => import("../../boards/pages/BoardDetail.jsx"));
const BoardWrite = lazy(() => import("../../boards/pages/BoardWrite.jsx"));

const BoardRouter = () => {
    return [
        {
            path: "",
            element: <Suspense fallback={Loading}><BoardList /></Suspense>
        },
        {
            path: "write",
            element: <Suspense fallback={Loading}><BoardWrite /></Suspense>
        },
        {
            path: "detail",
            element: <Suspense fallback={Loading}><BoardDetail /></Suspense>
        }
    ];
};

export default BoardRouter;