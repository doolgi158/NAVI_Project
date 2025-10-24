import { lazy, Suspense } from "react";


const Loading = <div>로딩 중...</div>;

// 사용자 - 공지사항
const NoticeList = lazy(() => import("../../core/client/pages/NoticeList.jsx"));
const NoticeDetail = lazy(() => import("../../core/client/pages/NoticeDetail.jsx"));

// 사용자 - 게시판
const BoardList = lazy(() => import("../../core/client/pages/BoardList.jsx"));
const BoardDetail = lazy(() => import("../../core/client/pages/BoardDetail.jsx"));
const BoardWrite = lazy(() => import("../../core/client/pages/BoardWrite.jsx"));

const ClientRouter = () => {
  return [
    // 공지사항 (사용자 - 읽기 전용)
    {
      key: "client-notice-list",
      path: "notice",
      element: (
        <Suspense fallback={Loading}>
          <NoticeList />
        </Suspense>
      ),
    },
    {
      key: "client-notice-detail",
      path: "notice/detail",
      element: (
        <Suspense fallback={Loading}>
          <NoticeDetail />
        </Suspense>
      ),
    },

    // 게시판 (사용자)
    {
      key: "client-board-list",
      path: "board",
      element: (
        <Suspense fallback={Loading}>
          <BoardList />
        </Suspense>
      ),
    },
    {
      key: "client-board-detail",
      path: "board/detail",
      element: (
        <Suspense fallback={Loading}>
          <BoardDetail />
        </Suspense>
      ),
    },
    {
      key: "client-board-write",
      path: "board/write",
      element: (
        <Suspense fallback={Loading}>
          <BoardWrite />
        </Suspense>
      ),
    },
  ];
};

export default ClientRouter;