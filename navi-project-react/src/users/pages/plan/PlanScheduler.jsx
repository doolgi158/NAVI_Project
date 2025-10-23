import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Splitter } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TravelMap from "./components/TravelMap";
import FooterLayout from "@/users/layout/FooterLayout";
import HeaderLayout from "@/users/layout/HeaderLayout";
import { savePlan, updatePlan, getPlanDetail } from "@/common/api/planApi";
import { getCookie } from "@/common/util/cookie";

export default function PlanScheduler() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    /** ✅ mode (create | edit | view) */
    const mode = searchParams.get("mode") || "create";
    const planId = searchParams.get("planId");
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    /** ✅ state 초기화 */
    const [meta, setMeta] = useState(state?.meta || {});
    const [days, setDays] = useState(state?.days || []);
    const [activeDayIdx, setActiveDayIdx] = useState(-1);
    const [markers, setMarkers] = useState([]);
    const [splitSize, setSplitSize] = useState(80);

    const FALLBACK_IMG = "https://placehold.co/150x150?text=No+Image";
    const DAY_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#F1C40F", "#9B59B6", "#FF8C00", "#8E44AD"];

    /** ✅ planId 있을 경우 서버에서 불러오기 */
    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId || mode === "create") return;
            try {
                const res = await getPlanDetail(planId);
                const data = res?.data;
                if (!data) return;

                setMeta({
                    title: data.title,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    thumbnailPath: data.thumbnailPath,
                });

                setDays(
                    (data.days || []).map((d) => ({
                        dateISO: d.dayDate,
                        orderNo: d.orderNo,
                        items: d.items || [],
                    }))
                );
            } catch (err) {
                console.error("❌ 여행계획 불러오기 실패:", err);
            }
        };
        fetchPlan();
    }, [planId, mode]);

    /** ✅ Split 크기 */
    useEffect(() => {
        setSplitSize(activeDayIdx === -1 ? 80 : 40);
    }, [activeDayIdx]);

    /** ✅ 지도 마커 갱신 */
    useEffect(() => {
        if (!days.length) return;

        const extractLatLng = (it) => {
            let lat = parseFloat(it.lat ?? it.latitude ?? it.mapy);
            let lng = parseFloat(it.lng ?? it.longitude ?? it.mapx);
            if (isNaN(lat) || isNaN(lng)) return null;
            return { lat, lng };
        };

        const allMarkers =
            activeDayIdx === -1
                ? days.flatMap((d, dayIdx) =>
                    d.items
                        .map((it, i) => {
                            const coords = extractLatLng(it);
                            if (!coords) return null;
                            return {
                                type: it.type,
                                title: it.title,
                                latitude: coords.lat,
                                longitude: coords.lng,
                                order: i + 1,
                                dayIdx,
                                color: DAY_COLORS[dayIdx % DAY_COLORS.length],
                            };
                        })
                        .filter(Boolean)
                )
                : (days[activeDayIdx]?.items || [])
                    .map((it, i) => {
                        const coords = extractLatLng(it);
                        if (!coords) return null;
                        return {
                            type: it.type,
                            title: it.title,
                            latitude: coords.lat,
                            longitude: coords.lng,
                            order: i + 1,
                            dayIdx: activeDayIdx,
                            color: DAY_COLORS[activeDayIdx % DAY_COLORS.length],
                        };
                    })
                    .filter(Boolean);

        setMarkers(allMarkers);
    }, [days, activeDayIdx]);

    /** ✅ Drag & Drop */
    const handleDragEnd = (result) => {
        if (isViewMode || !result.destination) return;
        const sourceDayIdx = parseInt(result.source.droppableId.split("-")[1]);
        const destDayIdx = parseInt(result.destination.droppableId.split("-")[1]);
        const newDays = [...days];
        const sourceItems = Array.from(newDays[sourceDayIdx].items);
        const [movedItem] = sourceItems.splice(result.source.index, 1);

        if (sourceDayIdx === destDayIdx) {
            sourceItems.splice(result.destination.index, 0, movedItem);
            newDays[sourceDayIdx].items = sourceItems;
        } else {
            const destItems = Array.from(newDays[destDayIdx].items);
            destItems.splice(result.destination.index, 0, movedItem);
            newDays[sourceDayIdx].items = sourceItems;
            newDays[destDayIdx].items = destItems;
        }

        setDays(newDays);
    };

    /** ✅ 일정 Step 렌더링 (Drag 상태 유지) */
    const renderStepItem = (it, i, isLast, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const imageSrc = it.img || FALLBACK_IMG;

        return (
            <Draggable
                key={`${dayIdx}-${i}-${it.title}`}
                draggableId={`${dayIdx}-${i}-${it.title}`}
                index={i}
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
                            ></div>
                        )}

                        <div
                            className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-semibold z-10 bg-white"
                            style={{ borderColor: color, color: color }}
                        >
                            {i + 1}
                        </div>

                        <div className="ml-2 flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">
                                    {it.startTime || "10:00"} ~ {it.endTime || "22:00"}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${it.type === "stay"
                                        ? "text-[#6846FF]"
                                        : it.type === "travel"
                                            ? "text-[#0088CC]"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {it.type === "stay"
                                        ? "숙소"
                                        : it.type === "travel"
                                            ? "여행지"
                                            : "기타"}
                                </span>
                                <span
                                    className="font-semibold text-[#2F3E46] text-sm truncate max-w-[140px]"
                                    title={it.title}
                                >
                                    {it.title}
                                </span>
                            </div>

                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img
                                    src={imageSrc}
                                    alt={it.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (!e.target.dataset.fallback) {
                                            e.target.dataset.fallback = "true";
                                            e.target.src = FALLBACK_IMG;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    /** ✅ 저장 / 수정 요청 */
    const handleConfirm = async () => {
        if (isViewMode) return;

        const userCookie = getCookie("userCookie");
        const userId = userCookie?.userId || "navi1";

        const firstTravelImg =
            days
                .flatMap((d) => d.items)
                .find((it) => it.type === "travel" && it.img && it.img.trim() !== "")
                ?.img || "https://placehold.co/400x300?text=Travel+Plan";

        const requestData = {
            title: meta.title || "새 여행 계획",
            startDate: meta.startDate,
            endDate: meta.endDate,
            startTime: meta.startTime,
            endTime: meta.endTime,
            thumbnailPath: firstTravelImg,
            days: days.map((d, idx) => ({
                dayDate: d.dateISO,
                orderNo: idx + 1,
                items: d.items.map((it) => ({
                    title: it.title,
                    type: it.type,
                    travelId: it.travelId ?? null,
                    stayId:
                        typeof it.stayId === "string"
                            ? Number(it.stayId.replace(/[^\d]/g, ""))
                            : it.stayId ?? null,
                    lat: it.lat ?? it.latitude ?? it.mapy ?? null,
                    lng: it.lng ?? it.longitude ?? it.mapx ?? null,
                    img:
                        it.img && it.img.trim() !== ""
                            ? it.img
                            : "https://placehold.co/150x150?text=No+Image",

                    // ✅ 추가해야 할 부분
                    startTime: it.startTime || "10:00",
                    endTime: it.endTime || "22:00",
                })),
            })),
        };

        try {
            if (isEditMode && planId) {
                await updatePlan(planId, requestData);
                alert("수정 완료!");
            } else {
                await savePlan(requestData);
                alert("저장 완료!");
            }
            navigate("/plans");
        } catch (err) {
            console.error("❌ 저장 중 오류:", err);
            alert("저장 실패");
        }
    };

    /** ✅ JSX */
    return (
        <>
            <HeaderLayout />
            <div className="w-full bg-gray-50">
                <Splitter
                    style={{
                        borderTop: "1px solid #eee",
                        transition: "all 0.4s ease-in-out",
                    }}
                    min="20%"
                    max="80%"
                    size={splitSize}
                >
                    {/* 좌측 일정 영역 */}
                    <Splitter.Panel style={{ background: "#fff", overflowY: "auto" }}>
                        <div className="flex h-full">
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

                                {!isViewMode && (
                                    <div className="pt-6 flex flex-col">
                                        <Button
                                            block
                                            type="primary"
                                            className="bg-[#2F3E46] mt-2"
                                            onClick={handleConfirm}
                                        >
                                            {isEditMode ? "수정" : "저장"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* 일정 리스트 (가로/세로 레이아웃 유지) */}
                            <div className="flex-1 p-10">
                                <div className="pb-6 bg-white">
                                    <h2 className="text-xl font-semibold text-[#2F3E46]">
                                        {meta.title || "전체 일정"}
                                        <span className="text-gray-500 text-sm p-5">
                                            {meta.startDate} ~ {meta.endDate}
                                        </span>
                                    </h2>
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    {activeDayIdx === -1 ? (
                                        <div className="flex gap-12 overflow-x-auto px-4 h-[calc(100vh-220px)]">
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
                                                            className="flex flex-col min-w-[280px] relative"
                                                        >
                                                            <h3 className="text-lg font-semibold text-[#2F3E46] mb-4 border-b pb-1">
                                                                {dayIdx + 1}일차{" "}
                                                                <span className="text-gray-400 text-sm">
                                                                    {d.dateISO}
                                                                </span>
                                                            </h3>
                                                            <div className="relative">
                                                                {d.items.map((it, i) =>
                                                                    renderStepItem(
                                                                        it,
                                                                        i,
                                                                        i === d.items.length - 1,
                                                                        dayIdx
                                                                    )
                                                                )}
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ))}
                                        </div>
                                    ) : (
                                        <Droppable
                                            droppableId={`day-${activeDayIdx}`}
                                            isDropDisabled={isViewMode}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className="flex flex-col gap-5 p-3 w-[350px]"
                                                >
                                                    {days[activeDayIdx]?.items.map((it, i) =>
                                                        renderStepItem(
                                                            it,
                                                            i,
                                                            i ===
                                                            days[activeDayIdx].items.length - 1,
                                                            activeDayIdx
                                                        )
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
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
                        <TravelMap markers={markers} step={6} />
                    </Splitter.Panel>
                </Splitter>
            </div>
            <FooterLayout />
        </>
    );
}
