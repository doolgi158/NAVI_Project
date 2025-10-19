import { lazy } from "react";
import MyPlanPage from "../../users/pages/plan/MyPlanPage.jsx";
import SharedPlan from "../../users/pages/plan/SharedPlan.jsx";

const TravelPlanMain = lazy(() => import("../../users/pages/plan/TravelPlanMain.jsx"))
const TravelPlanner = lazy(() => import("../../users/pages/plan/TravelPlanner.jsx"))
const PlanScheduler = lazy(() => import("../../users/pages/plan/PlanScheduler.jsx"))

const TravelRouter = () => {
    return [

        /*여행계획 홈 */
        { path: "", element: <TravelPlanMain /> },

        /* 여행계획 생성 단계*/
        { path: "planner", element: <TravelPlanner /> },

        /*나의 여행계획 스케줄링 */
        { path: "schedule", element: <PlanScheduler /> },

        /*나의 여행계획 목록 */
        { path: "myplans", element: <MyPlanPage /> },

        /*나의 여행계획 공유 */
        { path: "sharedplan", element: <SharedPlan /> },
    ]
}

export default TravelRouter;