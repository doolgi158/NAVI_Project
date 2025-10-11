import { Suspense, lazy } from "react";
import { useSelector } from 'react-redux';

const Loading = <div></div>
const TravelList = lazy(() => import("../../users/pages/travel/TravelPage.jsx"))
const TravelDetailPage = lazy(() => import("../../users/pages/travel/TravelDetailPage.jsx"))

/**  로그인된 사용자 정보 전달용 Wrapper 컴포넌트 */
const TravelDetailWrapper = () => {
  const user = useSelector((state) => state.login);
  return <TravelDetailPage id={user?.username || null} />;
};

const TravelRouter = () => {
    return [
        //여행지 리스트
        {
            path:"",
            element:(
                <Suspense fallback={Loading} >
                    <TravelList />
                </Suspense>
            )
        },

        //여행지 상세페이지
        {
            path: "detail/:travelId",
            element: (
                <Suspense fallback={Loading}>
                    <TravelDetailWrapper  />
                </Suspense>
            )
        },
    ]
}

export default TravelRouter;