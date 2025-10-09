import { Suspense, lazy } from "react";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div>Loading....</div>
const TravelList = lazy(() => import("../../users/pages/travel/TravelPage.jsx"))
const TravelDetailPage = lazy(() => import("../../users/pages/travel/TravelDetailPage.jsx"))

const TravelRouter = () => {
    return [
        //여행지 리스트
        {
            path:"",
            element:(
                <Suspense fallback={Loading} >
                    <ModalProvider>
                        <TravelList />
                    </ModalProvider>
                </Suspense>
            )
        },

        //여행지 상세페이지
        {
            path: "detail/:travelId",
            element: (
                <Suspense fallback={Loading}>
                    <ModalProvider>
                        <TravelDetailPage />
                    </ModalProvider>
                </Suspense>
            )
        },
    ]
}

export default TravelRouter;