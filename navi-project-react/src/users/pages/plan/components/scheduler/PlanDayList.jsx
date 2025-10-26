import React from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Modal, message } from "antd";
import PlanItemCard from "./PlanItemCard";
import dayjs from "dayjs";
import { deletePlanItem } from "@/common/api/planApi";

export default function PlanDayList({
    days = [],
    activeDayIdx = -1,
    isViewMode = false,
    onDragEnd = () => { },
    onEditTime = () => { },
    onAfterDelete = () => { },
    setDays = () => { },
    dayColors = [],
    fallbackImg = "https://placehold.co/150x150?text=No+Image",
    paginated = false, // ✅ 추가
}) {
    const handleDeleteItem = (dayIdx, itemIdx, item) => {
        const target = item || days[dayIdx]?.items[itemIdx];
        if (!target) return;

        Modal.confirm({
            title: "일정 삭제 확인",
            content: (
                <>
                    <b>{target.title}</b> 일정을 정말로 삭제하시겠습니까?
                </>
            ),
            okText: "삭제",
            cancelText: "취소",
            okButtonProps: { danger: true },
            centered: true,
            async onOk() {
                try {
                    if (target.itemId) {
                        await deletePlanItem(target.itemId);
                    }
                    setDays((prev) =>
                        prev.map((day, i) =>
                            i === dayIdx
                                ? { ...day, items: day.items.filter((_, j) => j !== itemIdx) }
                                : day
                        )
                    );
                    message.success(`"${target.title}" 일정이 삭제되었습니다.`);

                    if (onAfterDelete) {
                        if (target.travelId) onAfterDelete(target.travelId, "travel");
                        else if (target.stayId) onAfterDelete(target.stayId, "stay");
                    }
                } catch (err) {
                    console.error("❌ 일정 삭제 실패:", err);
                    message.error("삭제 실패. 다시 시도해주세요.");
                }
            },
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {activeDayIdx === -1 ? (
                // ✅ 전체 보기 모드에서 페이지 적용
                <div className="flex gap-12 overflow-x-auto px-4 custom-scroll">
                    {days.map((d, dayIdx) => (
                        <Droppable
                            key={d.dateISO || `day-${dayIdx}`}
                            droppableId={`day-${dayIdx}`}
                            isDropDisabled={isViewMode}
                        >
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-[300px] flex-shrink-0"
                                >
                                    <h2
                                        className="text-lg font-bold text-center sticky top-0 z-10 py-2 mb-5 "
                                        style={{ backgroundColor: `${dayColors[dayIdx % dayColors.length]}cc`, borderRadius: '20px' }}
                                    >
                                        <span style={{ color: "white" }}>
                                            DAY {d.orderNo || dayIdx + 1}
                                        </span>{" "}
                                        <span className="text-white text-sm">
                                            ({dayjs(d.dateISO).format("YYYY.MM.DD")})
                                        </span>
                                    </h2>
                                    <div className="relative min-h-[550px]">
                                        {d.items.map((it, i) => (
                                            <PlanItemCard
                                                key={it.itemId || it.travelId || it.stayId || `${activeDayIdx}-${i}`}
                                                item={it}
                                                index={i}
                                                dayIdx={dayIdx}
                                                isLast={i === d.items.length - 1}
                                                isViewMode={isViewMode}
                                                color={dayColors[dayIdx % dayColors.length]}
                                                fallbackImg={fallbackImg}
                                                onEditTime={onEditTime}
                                                onDeleteItem={handleDeleteItem}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            ) : (
                // ✅ 특정 일차 보기
                <Droppable
                    droppableId={`day-${activeDayIdx}`}
                    isDropDisabled={isViewMode}
                >
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="px-4 w-[350px]"
                        >
                            <h2
                                className="text-xl font-bold text-center sticky top-0 z-10 py-2 mb-4"
                                style={{ backgroundColor: `${dayColors[activeDayIdx % dayColors.length]}cc`, borderRadius: '20px' }}
                            >
                                <span
                                    style={{ color: 'white' }}
                                >
                                    DAY {days[activeDayIdx]?.orderNo || activeDayIdx + 1}
                                </span>{" "}
                                <span className="text-white text-sm">
                                    (
                                    {days[activeDayIdx]?.dateISO
                                        ? dayjs(days[activeDayIdx].dateISO).format("YYYY.MM.DD")
                                        : ""}
                                    )
                                </span>
                            </h2>

                            <div className="relative min-h-[550px]">
                                {days[activeDayIdx]?.items.map((it, i) => (
                                    <PlanItemCard
                                        key={it.itemId || it.travelId || it.stayId || `${activeDayIdx}-${i}`}
                                        item={it}
                                        index={i}
                                        dayIdx={activeDayIdx}
                                        isLast={i === days[activeDayIdx].items.length - 1}
                                        isViewMode={isViewMode}
                                        color={dayColors[activeDayIdx % dayColors.length]}
                                        fallbackImg={fallbackImg}
                                        onEditTime={onEditTime}
                                        onDeleteItem={handleDeleteItem}
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
