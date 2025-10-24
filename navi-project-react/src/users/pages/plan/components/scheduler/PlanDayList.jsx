// components/plan/scheduler/PlanDayList.jsx
import React from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import PlanItemCard from "./PlanItemCard";
import dayjs from "dayjs";

export default function PlanDayList({
    days = [],
    activeDayIdx = -1,
    isViewMode = false,
    onDragEnd = () => { },
    onEditTime = () => { },
    dayColors = [],
    fallbackImg = "https://placehold.co/150x150?text=No+Image",
}) {
    console.log("days for render:", days);
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {activeDayIdx === -1 ? (
                // ✅ 전체 보기
                <div className="flex gap-12 overflow-x-auto px-4 custom-scroll">
                    {days.map((d, dayIdx) => (
                        <Droppable
                            key={dayIdx}
                            droppableId={`day-${dayIdx}`}
                            isDropDisabled={isViewMode}
                        >
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col min-w-[300px] relative"
                                >
                                    {/* ✅ 타이틀 여백 통일 */}
                                    <h3 className="text-lg font-semibold text-[#2F3E46] mb-5 pt-1 border-b border-gray-200 pb-2 leading-tight">
                                        {dayIdx + 1}일차{" "}
                                        <span className="text-gray-400 text-sm">
                                            (
                                            {d?.dateISO
                                                ? dayjs(d.dateISO instanceof Object ? d.dateISO.toString() : d.dateISO).format("YYYY.MM.DD")
                                                : ""}
                                            )
                                        </span>
                                    </h3>


                                    <div className="relative min-h-[600px]">
                                        {d.items.map((it, i) => (
                                            <PlanItemCard
                                                key={`${dayIdx}-${i}-${it.title}-${i}`}
                                                item={it}
                                                index={i}
                                                dayIdx={dayIdx}
                                                isLast={i === d.items.length - 1}
                                                isViewMode={isViewMode}
                                                color={dayColors[dayIdx % dayColors.length]}
                                                fallbackImg={fallbackImg}
                                                onEditTime={onEditTime}
                                            />
                                        ))}
                                    </div>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            ) : (
                // ✅ 단일 일차 보기
                <Droppable
                    droppableId={`day-${activeDayIdx}`}
                    isDropDisabled={isViewMode}
                >
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex flex-col gap-5 pl-3 w-[315px]"
                        >
                            {/* ✅ 단일 보기 타이틀 (여백 통일) */}
                            <h2 className="text-lg font-semibold text-[#2F3E46] mb-5 pt-1 border-b border-gray-200 pb-2 leading-tight">
                                {activeDayIdx + 1}일차{" "}
                                <span className="text-gray-400 text-sm">
                                    (
                                    {days[activeDayIdx]?.dateISO
                                        ? dayjs(
                                            days[activeDayIdx].dateISO instanceof Object
                                                ? days[activeDayIdx].dateISO.toString()
                                                : days[activeDayIdx].dateISO
                                        ).format("YYYY.MM.DD")
                                        : ""}
                                    )
                                </span>
                            </h2>

                            <div className="relative min-h-[550px]">
                                {days[activeDayIdx]?.items.map((it, i) => (
                                    <PlanItemCard
                                        key={`${activeDayIdx}-${i}-${it.title}-${i}`}
                                        item={it}
                                        index={i}
                                        dayIdx={activeDayIdx}
                                        isLast={i === days[activeDayIdx].items.length - 1}
                                        isViewMode={isViewMode}
                                        color={dayColors[activeDayIdx % dayColors.length]}
                                        fallbackImg={fallbackImg}
                                        onEditTime={onEditTime}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        </div>
                    )}
                </Droppable>
            )}
        </DragDropContext>
    );
}
