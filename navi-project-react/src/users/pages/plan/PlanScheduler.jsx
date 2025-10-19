import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Splitter } from "antd";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "react-beautiful-dnd";
import TravelMap from "./components/TravelMap";
import FooterLayout from "@/users/layout/FooterLayout";
import HeaderLayout from "@/users/layout/HeaderLayout";

export default function PlanScheduler() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const meta = state?.meta || {};
    const [days, setDays] = useState(state?.days || []);
    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [markers, setMarkers] = useState([]);

    /** ✅ 지도용 마커 & 경로 갱신 */
    useEffect(() => {
        const allMarkers =
            activeDayIdx === -1
                ? days.flatMap((d) =>
                    d.items
                        .filter((it) => it.lat && it.lng)
                        .map((it, i) => ({
                            type: it.type,
                            title: it.title,
                            latitude: it.lat,
                            longitude: it.lng,
                            order: i + 1,
                        }))
                )
                : (days[activeDayIdx]?.items || [])
                    .filter((it) => it.lat && it.lng)
                    .map((it, i) => ({
                        type: it.type,
                        title: it.title,
                        latitude: it.lat,
                        longitude: it.lng,
                        order: i + 1,
                    }));

        setMarkers(allMarkers);
    }, [days, activeDayIdx]);

    /** ✅ DnD 완료 후 재정렬 */
    const handleDragEnd = (result, dayIndex) => {
        if (!result.destination) return;
        const newDays = [...days];
        const target = { ...newDays[dayIndex] };
        const reordered = Array.from(target.items);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        target.items = reordered;
        newDays[dayIndex] = target;
        setDays(newDays);
    };

    {/* ✅ 공통 렌더 함수 (일정 카드) */ }
    const renderDayList = (day, dayIdx) => (
        <Droppable droppableId={`droppable-${dayIdx}`}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="transition-all duration-300 flex flex-col items-center"
                >
                    {day.items.map((it, i) => {
                        const visibleItems = day.items.filter((x) => x.type !== "poi");
                        const actualIndex = visibleItems.findIndex((x) => x === it);

                        return (
                            <Draggable
                                key={`${dayIdx}-${i}-${it.title}`}
                                draggableId={`${dayIdx}-${i}-${it.title}`}
                                index={i}
                            >
                                {(prov, snapshot) => (
                                    <div
                                        ref={prov.innerRef}
                                        {...prov.draggableProps}
                                        {...prov.dragHandleProps}
                                        className={`transition-all duration-300 mb-4 p-3 rounded-2xl  bg-gray-50 shadow-md  cursor-grab flex gap-3 w-[400px] ${snapshot.isDragging
                                            ? "shadow-lg scale-[1.02] border-[#6846FF]/70 bg-[#f9f8ff]"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        {/* ✅ 텍스트 영역 */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {it.type === "poi" ? (
                                                    <div className="w-5 h-5 flex items-center justify-center text-[10px] rounded-full border-2 border-gray-300 text-gray-400">
                                                        ✈️
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`w-5 h-5 flex items-center justify-center text-[10px] font-semibold rounded-full border-2 ${it.type === "stay"
                                                            ? "border-red-600 text-red-600"
                                                            : it.type === "travel"
                                                                ? "border-[#2F3E46] text-[#2F3E46]"
                                                                : "border-gray-400 text-gray-400"
                                                            }`}
                                                    >
                                                        {actualIndex + 1}
                                                    </div>
                                                )}

                                                <span className="text-sm text-gray-500">
                                                    {it.startTime && it.endTime
                                                        ? `${it.startTime} ~ ${it.endTime}`
                                                        : "시간 미정"}
                                                </span>
                                            </div>

                                            <div>
                                                <p
                                                    className="text-base ml-7 font-semibold text-[#2F3E46] truncate"
                                                    title={it.title}
                                                >
                                                    {it.title}
                                                </p>
                                                <p
                                                    className={`text-xs ml-7 mt-1 ${it.type === "stay"
                                                        ? "text-[#6846FF]"
                                                        : it.type === "travel"
                                                            ? "text-[#0088CC]"
                                                            : "text-gray-500"
                                                        }`}
                                                >
                                                    {it.type === "stay"
                                                        ? "숙소"
                                                        : it.type === "travel"
                                                            ? "여행지"
                                                            : "공항"}
                                                </p>
                                            </div>
                                        </div>
                                        {/* ✅ 이미지 영역 */}
                                        {it.type === "poi" ? (
                                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                                                <img
                                                    src="https://myip.kr/LjlOl"
                                                    alt={it.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : it.img ? (
                                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={it.img}
                                                    alt={it.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}


                                    </div>
                                )}
                            </Draggable>
                        );
                    })}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );


    return (
        <>
            <HeaderLayout />
            <div className="w-full bg-gray-50">
                <Splitter
                    style={{
                        borderTop: "1px solid #eee",
                    }}
                    min="20%"
                    max="80%"
                    defaultSize="80%"
                >
                    {/* 왼쪽 영역 */}
                    <Splitter.Panel
                        style={{
                            background: "#fff",
                            overflowY: "auto",

                        }}
                    >
                        <div className="flex h-full">
                            {/* 사이드바 */}
                            <div className="w-28 border-r p-4 mt-10 flex flex-col justify-between bg-gray-50">
                                <div className="space-y-2">
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

                                {/* 하단 버튼 */}
                                <div className="pt-6 flex flex-col">
                                    <Button
                                        block
                                        className="border-gray-300 text-[#2F3E46]"
                                        onClick={() => console.log("편집")}
                                    >
                                        편집
                                    </Button>
                                    <Button
                                        block
                                        type="primary"
                                        className="bg-[#2F3E46] mt-2"
                                        onClick={() => navigate("/plans")}
                                    >
                                        저장
                                    </Button>
                                </div>
                            </div>

                            {/* 오른쪽 일정 영역 */}
                            <div className="flex-1 p-10 overflow-y-auto">
                                <div className="pb-10 bg-white">
                                    <h2 className="text-xl font-semibold text-[#2F3E46]">
                                        {meta.title || "일정 편집"}
                                        <span className="text-gray-500 text-sm p-5">
                                            {meta.startDate} ~ {meta.endDate}
                                        </span>
                                    </h2>
                                </div>

                                {/* ✅ 전체 or 단일 보기 */}
                                <DragDropContext
                                    onDragEnd={(result) => {
                                        if (result.destination) {
                                            const id = result.source.droppableId.split("-")[1];
                                            handleDragEnd(result, parseInt(id, 10));
                                        }
                                    }}
                                >
                                    {activeDayIdx === -1 ? (
                                        <div className="flex gap-6 items-stretch overflow-x-auto h-[calc(100vh-220px)]">
                                            {days.map((d, idx) => (
                                                <div
                                                    key={d.dateISO}
                                                    className="flex-1 w-[450px] bg-white rounded-lg flex flex-col"
                                                >
                                                    <div className="text-lg font-semibold mb-2 text-[#2F3E46] px-3 py-2 text-left">
                                                        {idx + 1}일차{" "}
                                                        <span className="text-gray-400 ml-3 text-sm">
                                                            {d.dateISO}
                                                        </span>
                                                    </div>
                                                    {renderDayList(d, idx)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-semibold text-[#2F3E46] mb-6">
                                                {activeDayIdx + 1}일차
                                                <span className="text-gray-400 text-sm ml-3">
                                                    {days[activeDayIdx]?.dateISO}
                                                </span>
                                            </h3>
                                            {renderDayList(days[activeDayIdx], activeDayIdx)}
                                        </>
                                    )}
                                </DragDropContext>
                            </div>
                        </div>
                    </Splitter.Panel>

                    {/* 오른쪽 지도 */}
                    <Splitter.Panel
                        style={{
                            background: "#fafafa",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* ✅ 드래그 시 TravelMap 즉시 업데이트 */}
                        <TravelMap markers={markers} step={6} />
                    </Splitter.Panel>
                </Splitter>
            </div>
            <FooterLayout />
        </>
    );
}
