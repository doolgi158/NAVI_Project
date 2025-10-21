import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;

// 관리자 - 공지사항
const ManagerNoticeList = lazy(() => import("../../core/manager/pages/ManagerNoticeList.jsx"));
const ManagerNoticeWrite = lazy(() => import("../../core/manager/pages/ManagerNoticeWrite.jsx"));
const ManagerNoticeDetail = lazy(() => import("../../core/manager/pages/ManagerNoticeDetail.jsx"));

// 관리자 - 게시판
const ManagerBoardList = lazy(() => import("../../core/manager/pages/ManagerBoardList.jsx"));
const ManagerBoardDetail = lazy(() => import("../../core/manager/pages/ManagerBoardDetail.jsx"));

const ManagerRouter = () => {
  return [
    // 관리자 - 공지사항
    {
      key: "manager-notice-list",
      path: "notice",
      element: (
        <Suspense fallback={Loading}>
          <ManagerNoticeList />
        </Suspense>
      ),
    },
    {
      key: "manager-notice-write",
      path: "notice/write",
      element: (
        <Suspense fallback={Loading}>
          <ManagerNoticeWrite />
        </Suspense>
      ),
    },
    {
      key: "manager-notice-detail",
      path: "notice/detail",
      element: (
        <Suspense fallback={Loading}>
          <ManagerNoticeDetail />
        </Suspense>
      ),
    },

    // 관리자 - 게시판
    {
      key: "manager-board-list",
      path: "board",
      element: (
        <Suspense fallback={Loading}>
          <ManagerBoardList />
        </Suspense>
      ),
    },
    {
      key: "manager-board-detail",
      path: "board/detail",
      element: (
        <Suspense fallback={Loading}>
          <ManagerBoardDetail />
        </Suspense>
      ),
    },
  ];
};

export default ManagerRouter;