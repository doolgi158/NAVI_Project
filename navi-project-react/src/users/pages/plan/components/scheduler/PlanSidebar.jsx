// components/plan/scheduler/PlanSidebar.jsx
import React from "react";
import { Button } from "antd";
import dayjs from "dayjs";

/**
 * PlanSidebar
 * - 왼쪽 패널: 전체 / 1일차~ 버튼, 이전 / 저장(수정) 버튼
 * - 기존 PlanScheduler 왼쪽 Panel 그대로 분리
 */
export default function PlanSidebar({
    days = [],
    activeDayIdx = -1,
    setActiveDayIdx = () => { },
    isViewMode = false,
    isEditMode = false,
    navigate,
    meta = {},
    state = {},
    handleConfirm = () => { },
}) {
    return (
        <div className="w-28 border-r p-4 flex flex-col justify-between bg-gray-50">
            {/* ✅ 상단: 일차 선택 버튼 */}
            <div className="space-y-2 mt-5">
                <Button
                    block
                    type={activeDayIdx === -1 ? "primary" : "default"}
                    onClick={() => setActiveDayIdx(-1)}
                >
                    전체
                </Button>

                {days.map((d, idx) => (
                    <Button
                        key={d.dateISO}
                        block
                        type={idx === activeDayIdx ? "primary" : "default"}
                        onClick={() => setActiveDayIdx(idx)}
                    >
                        {idx + 1}일차
                    </Button>
                ))}
            </div>

            {/* ✅ 하단: 이전 / 저장 */}
            {!isViewMode && (
                <div className="pt-6 flex flex-col gap-2">
                    {/* 이전 버튼 */}
                    <Button
                        block
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                        onClick={() => {
                            navigate("/plans/planner", {
                                state: {
                                    from: "scheduler",
                                    step: 3,
                                    restoreData: {
                                        meta,
                                        days,
                                        dayTimes: state?.dayTimes || {},
                                        title: meta.title,
                                        dateRange: [dayjs(meta.startDate), dayjs(meta.endDate)],
                                        times: state?.dayTimes || {},
                                        selectedTravels: state?.selectedTravels || [],
                                        selectedStays: state?.selectedStays || [],
                                        stayPlans: state?.stayPlans || {},
                                    },
                                },
                            });
                        }}
                    >
                        이전
                    </Button>

                    {/* 저장/수정 버튼 */}
                    <Button
                        block
                        type="primary"
                        className="bg-[#2F3E46]"
                        onClick={handleConfirm}
                    >
                        {isEditMode ? "수정" : "저장"}
                    </Button>
                </div>
            )}
        </div>
    );
}
