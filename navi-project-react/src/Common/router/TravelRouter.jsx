import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { ModalProvider } from "../components/Login/ModalProvider.jsx";

const Loading = <div>Loading....</div>
const TravelList = lazy(() => import("../../users/pages/travel/TravelList.jsx"))
const TravelDetailPage = lazy(() => import("../../users/pages/travel/TravelDetailPage.jsx"))

const TravelRouter = () => {
    return [
        //여행지 리스트
        {
            path:"list",
            element:(
                <Suspense fallback={Loading} >
                    <ModalProvider>
                        <TravelList />
                    </ModalProvider>
                </Suspense>
            )
        },
        {
            path: "",
            element: <Navigate replace to="list" />
        },
        //여행지 상세페이지
        {
            path: "detail/:id",
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