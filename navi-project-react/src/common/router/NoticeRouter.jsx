import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;

const NoticeList = lazy(() => import("../../notice/components/NoticeList"));
const NoticeDetail = lazy(() => import("../../notice/components/NoticeDetail"));
const NoticeForm = lazy(() => import("../../notice/components/NoticeForm"));

const NoticeRouter = () => {
    return [
        {
            path: "",
            element: <Suspense fallback={Loading}><NoticeList /></Suspense>
        },
        {
            path: "form",
            element: <Suspense fallback={Loading}><NoticeForm /></Suspense>
        },
        {
            path: "detail",
            element: <Suspense fallback={Loading}><NoticeDetail /></Suspense>
        }
    ];
};

export default NoticeRouter;