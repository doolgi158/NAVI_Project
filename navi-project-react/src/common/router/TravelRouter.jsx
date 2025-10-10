import { Suspense, lazy } from "react";

const Loading = <div></div>
const TravelList = lazy(() => import("../../users/pages/travel/TravelPage.jsx"))
const TravelDetailPage = lazy(() => import("../../users/pages/travel/TravelDetailPage.jsx"))

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
                    <TravelDetailPage />
                </Suspense>
            )
        },
    ]
}

export default TravelRouter;