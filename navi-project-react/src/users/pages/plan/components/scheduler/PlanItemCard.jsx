import React from "react";
import { Button, message } from "antd";
import { EditOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Draggable } from "@hello-pangea/dnd";

/**
 * PlanItemCard
 * - DnD 가능 + 시간 수정 + 개별 일정 삭제
 */
export default function PlanItemCard({
    item,
    index,
    dayIdx,
    isLast,
    isViewMode = false,
    color = "#3498DB",
    fallbackImg = "https://placehold.co/150x150?text=No+Image",
    onEditTime = () => { },
    onDeleteItem = () => { }, // ✅ 부모 상태(days) 갱신용
}) {
    const imageSrc = item.img || fallbackImg;

    /** ✅ 삭제 요청 (confirm은 부모에서 처리) */
    const handleDelete = () => {
        if (!item.itemId && !item.travelId && !item.title) {
            message.warning("삭제할 대상이 올바르지 않습니다.");
            return;
        }
        onDeleteItem(dayIdx, index, item);
    };

    return (
        <Draggable
            key={`${dayIdx}-${index}-${item.title}-${index}`}
            draggableId={`${dayIdx}-${index}-${item.title}-${index}`}
            index={index}
            isDragDisabled={isViewMode}
        >
            {(prov, snapshot) => (
                <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className={`relative pl-8 pb-6 transition-all ${snapshot.isDragging ? "scale-[1.02]" : ""}`}
                >
                    {!isLast && (
                        <div
                            className="absolute top-5 left-[13px] w-[2px] h-[calc(100%-0.5rem)] z-0"
                            style={{ backgroundColor: color }}
                        />
                    )}

                    <div
                        className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-semibold z-10 bg-white"
                        style={{ borderColor: color, color }}
                    >
                        {index + 1}
                    </div>

                    <div className="ml-2 flex items-center justify-between gap-3">
                        {/* 텍스트 영역 */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>
                                    {item.startTime && item.startTime !== "- : -"
                                        ? item.startTime
                                        : "- : -"}{" "}
                                    ~{" "}
                                    {item.endTime && item.endTime !== "- : -"
                                        ? item.endTime
                                        : "- : -"}
                                </span>

                                {!isViewMode && (
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => onEditTime(dayIdx, index, item)}
                                    />
                                )}
                            </div>

                            <span
                                className={`text-xs font-semibold ${item.type === "stay"
                                    ? "text-[#6846FF]"
                                    : item.type === "travel"
                                        ? "text-[#0088CC]"
                                        : "text-gray-400"
                                    }`}
                            >
                                {item.type === "stay"
                                    ? "숙소"
                                    : item.type === "travel"
                                        ? "여행지"
                                        : "기타"}
                            </span>

                            <span
                                className="font-semibold text-[#2F3E46] text-sm truncate max-w-[160px]"
                                title={item.title}
                            >
                                {item.title}
                            </span>
                        </div>

                        {/* 썸네일 + 삭제버튼 */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img
                                    src={imageSrc}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (!e.target.dataset.fallback) {
                                            e.target.dataset.fallback = "true";
                                            e.target.src = fallbackImg;
                                        }
                                    }}
                                />
                            </div>

                            {!isViewMode &&
                                !(item.type === "poi" &&
                                    (item.title?.includes("제주공항 도착") || item.title?.includes("제주공항 출발"))) && (
                                    < Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={< MinusCircleOutlined />}
                                        onClick={handleDelete}
                                        className="mt-1 text-xs"
                                    >
                                        삭제
                                    </Button>
                                )}
                        </div>
                    </div>
                </div>
            )
            }
        </Draggable >
    );
}
