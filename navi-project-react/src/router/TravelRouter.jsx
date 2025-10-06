import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";

const Loading = (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl text-blue-500 animate-pulse">여행 정보 로딩 중...</div>
    </div>
);
const TravelPage = lazy(() => import("../users/pages/TravelPage.jsx")) 
const TravelDetailPage = lazy(() => import("../users/pages/TravelDetailPage.jsx"))

export const TravelRouter = 
     [
        //여행지 리스트
        {
            path:"",
            element:<Suspense fallback={Loading} ><TravelPage /></Suspense>
        },
        //여행지 상세페이지
        {
            path: "detail/:travelId",
            element: <Suspense fallback={Loading}><TravelDetailPage /></Suspense>,
        },
    ]
