import { Suspense, lazy } from "react";
import PlanStep1 from "../../users/pages/plan/PlanStep1.jsx";
import PlanStep2 from "../../users/pages/plan/PlanStep2.jsx";
import PlanStep3 from "../../users/pages/plan/PlanStep3.jsx";
import PlanStep4 from "../../users/pages/plan/PlanStep4.jsx";
import MyPlanPage from "../../users/pages/plan/MyPlanPage.jsx";
import SharedPlan from "../../users/pages/plan/SharedPlan.jsx";

const TravelPlanMain = lazy(() => import("../../users/pages/plan/TravelPlanMain.jsx"))

const TravelRouter = () => {
    return [

        /*여행계획 홈 */
        { path: "",  element: <TravelPlanMain />  },

        /* 여행계획 생성 단계*/
        { path: "step1",  element: <PlanStep1 />  },
        { path: "step2",  element: <PlanStep2 />  },
        { path: "step3",  element: <PlanStep3 />  },
        { path: "step4",  element: <PlanStep4 />  },

        /*나의 여행계획 목록 */
        { path: "myplans",  element: <MyPlanPage />  },

         /*나의 여행계획 공유 */
        { path: "sharedplan",  element: <SharedPlan />  },
    ]
}

export default TravelRouter;