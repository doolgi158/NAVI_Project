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
    /** ✅ 타입별 이미지 경로 계산 */
    const getImageSrc = (item) => {
        // 1️⃣ 공항(poi)은 서버 이미지로 고정
        if (item.type === "poi") {
            return "http://localhost:8080/images/travel/airport.jpg";
        }

        // 2️⃣ 숙소/여행지는 서버 경로 or 절대경로 우선
        if (item.img) {
            if (item.img.startsWith("http")) return item.img;
            if (item.img.startsWith("/")) return `http://localhost:8080${item.img}`;
        }

        // 3️⃣ fallback
        return fallbackImg;
    };

    const imageSrc = getImageSrc(item);

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
                    className={`relative pl-8 pb-6 transition-all ${snapshot.isDragging ? "scale-[1.02]" : ""
                        }`}
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
                                            : item.type === "poi"
                                                ? "text-[#FF6B00]"
                                                : "text-gray-400"
                                    }`}
                            >
                                {item.type === "stay"
                                    ? "숙소"
                                    : item.type === "travel"
                                        ? "여행지"
                                        : item.type === "poi"
                                            ? "공항"
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
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            item.type === "poi"
                                                ? "http://localhost:8080/images/travel/airport.jpg"
                                                : fallbackImg;
                                    }}
                                />
                            </div>

                            {!isViewMode &&
                                !(item.type === "poi" &&
                                    (item.title?.includes("제주공항 도착") ||
                                        item.title?.includes("제주공항 출발"))) && (
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<MinusCircleOutlined />}
                                        onClick={handleDelete}
                                        className="mt-1 text-xs"
                                    >
                                        삭제
                                    </Button>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
