import { Suspense, lazy } from "react";

const Loading = <div></div>
const PlanList = lazy(() => import("../../users/pages/plan/PlanList.jsx"))

const TravelRouter = () => {
    return [

        //여행계획 리스트
        {
            path: "",
            element: (
                <Suspense fallback={Loading}>
                    <PlanList />
                </Suspense>
            )
        },
    ]
}

export default TravelRouter;