// components/plan/scheduler/PlanDayList.jsx
import React from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import PlanItemCard from "./PlanItemCard";

/**
 * PlanDayList
 * - 전체 보기(모든 일차) + 특정 일차 보기 모두 처리
 * - DnD 핸들링은 상위 PlanScheduler에서 담당
 */
export default function PlanDayList({
    days = [],
    activeDayIdx = -1,
    isViewMode = false,
    onDragEnd = () => { },
    onEditTime = () => { },
    dayColors = [],
    fallbackImg = "https://placehold.co/150x150?text=No+Image",
}) {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {activeDayIdx === -1 ? (
                // ✅ 전체 보기 (여러 일차 가로로 나열)
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
                                    <h3 className="text-lg font-semibold text-[#2F3E46] mb-4 border-b pb-1">
                                        {dayIdx + 1}일차{" "}
                                        <span className="text-gray-400 text-sm">{d.dateISO}</span>
                                    </h3>
                                    <div className="relative">
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
                            className="flex flex-col gap-5 p-3 w-[380px]"
                        >
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
                    )}
                </Droppable>
            )}
        </DragDropContext>
    );
}
