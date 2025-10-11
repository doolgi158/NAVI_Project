import { Suspense, lazy } from "react";
import { useSelector } from "react-redux";

const Loading = <div>Loading...</div>;
const TravelList = lazy(() => import("../../users/pages/travel/TravelPage.jsx"));
const TravelDetailPage = lazy(() => import("../../users/pages/travel/TravelDetailPage.jsx"));

/** ✅ 로그인된 사용자 정보 전달용 Wrapper */
const TravelListWrapper = () => {
  const user = useSelector((state) => state.login);
  return <TravelList user={user} />;
};

const TravelDetailWrapper = () => {
  const user = useSelector((state) => state.login);
  return <TravelDetailPage id={user?.username || null} />;
};

const TravelRouter = () => [
  {
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <TravelListWrapper />
      </Suspense>
    ),
  },
  {
    path: "detail/:travelId",
    element: (
      <Suspense fallback={Loading}>
        <TravelDetailWrapper />
      </Suspense>
    ),
  },
];

export default TravelRouter;
