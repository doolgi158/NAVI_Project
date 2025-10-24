import React from "react";
import { Button, Tag } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";

export default function ReviewPanel({
    title,
    dateRange,
    selectedTravels = [],
    selectedStays = [],
    stayPlans = {},
    onEditTitle,    // setStep(2)
    onEditDates,    // setStep(1)
    onEditTravels,  // setStep(4)
    onEditStays,    // setStep(5)
    onCreateSchedule, // 일정 생성 이동
}) {
    return (
        <div className="flex flex-col h-full bg-white p-5 overflow-y-auto">
            <TitleDateDisplay title={title} dateRange={dateRange} />

            {/* 제목/기간 */}
            <section className="mt-4 pb-5 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#2F3E46]">기본 정보</h3>
                    <Button size="small" onClick={onEditTitle}>편집</Button>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                    <p>제목: <b>{title || "제목 없음"}</b></p>
                    <p>
                        기간:{" "}
                        {dateRange?.[0]?.format("YYYY.MM.DD")} ~{" "}
                        {dateRange?.[1]?.format("YYYY.MM.DD")}
                    </p>
                </div>
            </section>

            {/* 여행지 */}
            <section className="mt-5 pb-5 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#2F3E46]">
                        선택한 여행지 ({selectedTravels.length})
                    </h3>
                    <Button size="small" onClick={onEditTravels}>편집</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTravels.length === 0 ? (
                        <p className="text-gray-500 text-sm">선택된 여행지가 없습니다.</p>
                    ) : (
                        selectedTravels.map((t) => (
                            <Tag key={t.travelId} className="px-3 py-1">{t.title}</Tag>
                        ))
                    )}
                </div>
            </section>

            {/* 숙소 */}
            <section className="mt-5 pb-5 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#2F3E46]">
                        선택한 숙소 ({selectedStays.length})
                    </h3>
                    <Button size="small" onClick={onEditStays}>편집</Button>
                </div>
                <div className="mt-3 space-y-2">
                    {selectedStays.length === 0 ? (
                        <p className="text-gray-500 text-sm">숙소 미정</p>
                    ) : (
                        selectedStays.map((s) => (
                            <div key={s.accId} className="flex items-center gap-3">
                                <img
                                    src={
                                        s.accImages?.[0]
                                            ? (s.accImages?.[0].startsWith("http")
                                                ? s.accImages?.[0]
                                                : `http://localhost:8080${s.accImages?.[0]}`)
                                            : "https://placehold.co/80x80?text=Stay"
                                    }
                                    className="w-10 h-10 rounded object-cover"
                                />
                                <div className="text-sm">
                                    <div className="font-medium">{s.title}</div>
                                    <div className="text-gray-500">
                                        {(stayPlans[s.accId] || []).join(", ")}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 하단 버튼 */}
            <div className="mt-6 flex gap-8">
                <Button onClick={onEditDates}>날짜 다시 선택</Button>
                <Button
                    type="primary"
                    className="bg-[#2F3E46] ml-auto"
                    onClick={onCreateSchedule}
                >
                    일정 생성
                </Button>
            </div>
        </div>
    );
}