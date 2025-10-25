import React, { useState } from "react";
import { Button } from "antd";
import { LeftOutlined, EditOutlined, PlusOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TravelAddModal from "./TravelAddModal";
import StayAddModal from "./StayAddModal";

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
    setMode = () => { },
    stageTravels = [],
    stageStays = [],
    stageStayPlans = {},
    deletedTravelIds = [],
    deletedStayIds = [],
    handleAddTravel = () => { },
    handleAddStay = () => { },

}) {
    const [showTravelModal, setShowTravelModal] = useState(false);
    const [showStayModal, setShowStayModal] = useState(false);

    return (
        <div
            className="flex flex-col bg-white h-full border-r border-gray-200 transition-all duration-500"
            style={{
                flexBasis: "15%",
                minWidth: "150px",
                maxWidth: "240px",
            }}
        >
            {/* ✅ 상단: 목록으로 버튼 */}
            <div className="flex items-center justify-left h-[60px] border-b border-gray-100">
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => navigate("/plans")}
                    className="text-[#0A3D91] hover:text-[#06306E] font-medium transition-colors"
                >
                    목록으로
                </Button>
            </div>

            {/* ✅ 중앙: 진행 단계 + 일차 목록 */}
            <div className="flex flex-col flex-1 overflow-y-auto px-5 py-4 custom-scroll">


                {/* ✅ 전체 일정 버튼 */}
                <div className="space-y-2 mb-4 ">
                    <Button
                        block
                        type={activeDayIdx === -1 ? "primary" : "default"}
                        onClick={() => setActiveDayIdx(-1)}
                        className={`${activeDayIdx === -1
                            ? "!bg-[#FFF5B7] !border-none !text-[#2F3E46] font-semibold "
                            : "hover:!bg-[#FAF9F6] "
                            }`}
                    >
                        전체 일정
                    </Button>

                    {/* ✅ n일차 버튼 */}
                    {days.map((d, idx) => (
                        <Button
                            key={d.dateISO}
                            block
                            type={idx === activeDayIdx ? "primary" : "default"}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`${idx === activeDayIdx
                                ? "!bg-[#FFF5B7] !border-none !text-[#2F3E46] font-semibold"
                                : "hover:!bg-[#FAF9F6]"
                                }`}
                        >
                            {idx + 1}일차
                        </Button>
                    ))}
                </div>

                {/* ✅ 일차 목록 아래쪽: 액션 버튼 */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2">
                    {isViewMode ? (
                        <Button
                            block
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setMode("edit")}
                            className="bg-[#2F3E46] hover:bg-[#1E2E32] border-none text-white"
                        >
                            수정하기
                        </Button>
                    ) : (
                        <>{!isEditMode && (
                            <Button
                                block
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
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
                                                dateRange: [
                                                    dayjs(meta.startDate),
                                                    dayjs(meta.endDate),
                                                ],
                                                times: state?.dayTimes || {},
                                                selectedTravels: stageTravels,      // ✅ 수정된 stageTravels 전달
                                                selectedStays: stageStays,          // ✅ 수정된 stageStays 전달
                                                stayPlans: stageStayPlans,          // ✅ 수정된 숙소배정 전달
                                            },
                                            deletedTravelIds,
                                            deletedStayIds,
                                            refreshSource: "scheduler",
                                        },
                                    });
                                }}
                            >
                                이전
                            </Button>
                        )}

                            {isEditMode && (
                                <>
                                    <Button
                                        block
                                        icon={<PlusOutlined />}
                                        className="bg-[#FFF5B7] hover:bg-[#FFE98A] text-[#2F3E46] border-none"
                                        onClick={() => setShowTravelModal(true)}
                                    >
                                        여행지 추가
                                    </Button>
                                    <Button
                                        block
                                        icon={<HomeOutlined />}
                                        className="bg-[#DCEFFF] hover:bg-[#B8E0FF] text-[#2F3E46] border-none"
                                        onClick={() => setShowStayModal(true)}
                                    >
                                        숙소 추가
                                    </Button>
                                </>
                            )}
                            <Button
                                block
                                type="primary"
                                className="bg-[#2F3E46] hover:bg-[#1E2E32] border-none"
                                onClick={handleConfirm}
                            >
                                {isEditMode ? "수정 완료" : "저장"}
                            </Button>
                        </>
                    )}
                </div>

                <TravelAddModal
                    open={showTravelModal}
                    onClose={() => setShowTravelModal(false)}
                    days={days}
                    onAdd={handleAddTravel}
                />
                <StayAddModal
                    open={showStayModal}
                    onClose={() => setShowStayModal(false)}
                    days={days}
                    onAdd={handleAddStay}
                />
            </div>
        </div>
    );
}
