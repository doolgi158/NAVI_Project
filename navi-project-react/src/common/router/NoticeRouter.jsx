// import NoticeWrite from "@/notice/components/NoticeWrite";
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;

const NoticeList = lazy(() => import("../../notice/components/NoticeList"));
const NoticeDetail = lazy(() => import("../../notice/components/NoticeDetail"));
const NoticeWrite = lazy(() => import("../../notice/components/NoticeWrite"));

const NoticeRouter = () => {
    return [
        {
            path: "",
            element: <Suspense fallback={Loading}><NoticeList /></Suspense>
        },
        {
            path: "write",
            element: <Suspense fallback={Loading}><NoticeWrite /></Suspense>
        },
        {
            path: "detail",
            element: <Suspense fallback={Loading}><NoticeDetail /></Suspense>
        }
    ];
};

export default NoticeRouter;