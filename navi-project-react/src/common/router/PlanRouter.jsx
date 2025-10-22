import { lazy } from "react";
import SharedPlan from "../../users/pages/plan/SharedPlan.jsx";

const TravelPlanMain = lazy(() => import("../../users/pages/plan/TravelPlanMain.jsx"))  //홈
const TravelPlanner = lazy(() => import("../../users/pages/plan/TravelPlanner.jsx"))    //등록
const PlanScheduler = lazy(() => import("../../users/pages/plan/PlanScheduler.jsx"))    //상세/수정/등록 상세

const PlanRouter = () => {
    return [

        /* 여행계획 홈,리스트 */
        { path: "", element: <TravelPlanMain /> },

        /* 여행계획 등록*/
        { path: "planner", element: <TravelPlanner /> },

        /* 여행계획 상세 등록*/
        { path: "scheduler", element: <PlanScheduler /> },

        /* 조회/수정 */
        { path: "planner/detail", element: <PlanScheduler /> },

        /*공유 */
        { path: "sharedplan", element: <SharedPlan /> },
    ]


}

export default PlanRouter;