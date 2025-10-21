import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Splitter, Spin } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TravelMap from "./components/TravelMap";
import FooterLayout from "@/users/layout/FooterLayout";
import HeaderLayout from "@/users/layout/HeaderLayout";
import { getPlanDetail, savePlan, updatePlan } from "@/common/api/planApi";
import { getCookie } from "@/common/util/cookie";

export default function PlanScheduler() {
    const location = useLocation();
    const initialState = location.state;
    const [searchParams] = useSearchParams();
    const planId = searchParams.get("planId");
    const mode = searchParams.get("mode") || (initialState ? "create" : "edit");

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ title: "", startDate: "", endDate: "" });
    const [days, setDays] = useState([]);
    const [activeDayIdx, setActiveDayIdx] = useState(-1);
    const [markers, setMarkers] = useState([]);
    const [splitSize, setSplitSize] = useState(80);

    const isViewMode = mode === "view";
    const DAY_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#F1C40F", "#9B59B6", "#FF8C00", "#8E44AD"];

    /** ✅ 데이터 로드 (planId 존재 시 상세조회) */
    useEffect(() => {
        const fetchDetail = async () => {
            if (planId) {
                try {
                    const res = await getPlanDetail(planId);


                    // ✅ 데이터 유효성 확인
                    if (!res || !res.days) {
                        console.warn("⚠️ 불완전한 plan 데이터:", res);
                        setLoading(false);
                        return;
                    }

                    // ✅ 메타 정보
                    setMeta({
                        title: res.title || "제목 없음",
                        startDate: res.startDate,
                        endDate: res.endDate,
                    });

                    // ✅ 일자별 아이템 세팅
                    const parsedDays = res.days.map((day) => ({
                        dateISO: day.dayDate,
                        items: (day.items || []).map((it) => ({
                            title: it.title,
                            type: it.type,
                            travelId: it.travelId,
                            stayId: it.stayId,
                            lat: it.lat,
                            lng: it.lng,
                            img: it.img,
                            startTime: it.startTime,
                            endTime: it.endTime,
                        })),
                    }));

                    setDays(parsedDays);
                } catch (err) {
                    console.error("❌ 계획 상세 불러오기 실패:", err);
                } finally {
                    setLoading(false);
                }
            } else if (location.state) {
                // 🔹 TravelPlanner에서 넘어온 신규 계획 데이터 세팅
                setMeta(location.state.meta);
                setDays(location.state.days);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [planId, location.state]);



    /** ✅ 분할 비율 동적 조정 */
    useEffect(() => {
        setSplitSize(activeDayIdx === -1 ? 80 : 40);
    }, [activeDayIdx]);

    /** ✅ 지도 마커 갱신 */
    useEffect(() => {
        if (!Array.isArray(days)) return;
        const allMarkers =
            activeDayIdx === -1
                ? days.flatMap((d, dayIdx) =>
                    (d?.items || [])
                        .filter((it) => it.lat && it.lng)
                        .map((it, i) => ({
                            type: it.type,
                            title: it.title,
                            latitude: it.lat,
                            longitude: it.lng,
                            order: i + 1,
                            dayIdx,
                            color: DAY_COLORS[dayIdx % DAY_COLORS.length],
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
                        dayIdx: activeDayIdx,
                        color: DAY_COLORS[activeDayIdx % DAY_COLORS.length],
                    }));

        setMarkers(allMarkers);
    }, [days, activeDayIdx]);

    /** ✅ Drag & Drop 핸들러 */
    const handleDragEnd = (result) => {
        if (!result.destination || isViewMode) return;
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

    /** ✅ 여행계획 저장 or 수정 */
    const handleSave = async () => {
        if (isViewMode) return;
        const userCookie = getCookie("userCookie");
        const userId = userCookie?.userId || "navi1";

        const requestData = {
            userId,
            title: meta.title || "새 여행 계획",
            startDate: meta.startDate,
            endDate: meta.endDate,
            travels: days.flatMap((d) =>
                (d.items || [])
                    .filter((it) => it.type === "travel")
                    .map((it) => ({
                        travelId: it.travelId,
                        travelName: it.title,
                    }))
            ),
            stays: days.flatMap((d) =>
                (d.items || [])
                    .filter((it) => it.type === "stay")
                    .map((it) => ({
                        stayId: it.stayId,
                        stayName: it.title,
                    }))
            ),
            thumbnailPath:
                days.flatMap((d) => d.items.map((it) => it.img)).find((img) => img) ||
                "https://via.placeholder.com/300x200.png?text=Travel+Plan",
        };

        try {
            if (planId) {
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

    /** ✅ 일정 Step 렌더링 */
    const renderStepItem = (it, i, isLast, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
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
                            />
                        )}
                        <div
                            className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-semibold z-10 bg-white"
                            style={{ borderColor: color, color }}
                        >
                            {i + 1}
                        </div>

                        <div className="ml-2 flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">
                                    {it.startTime} ~ {it.endTime}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${it.type === "stay"
                                        ? "text-[#6846FF]"
                                        : it.type === "travel"
                                            ? "text-[#0088CC]"
                                            : it.type === "poi"
                                                ? "text-[#cea433]"
                                                : "text-gray-400"
                                        }`}
                                >
                                    {it.type === "stay"
                                        ? "숙소"
                                        : it.type === "travel"
                                            ? "여행지"
                                            : it.type === "poi"
                                                ? "공항"
                                                : "기타"}
                                </span>
                                <span
                                    className="font-semibold text-[#2F3E46] text-sm truncate max-w-[140px]"
                                    title={it.title}
                                >
                                    {it.title}
                                </span>
                            </div>

                            {it.type === "poi" ? (
                                // ✅ POI(공항 등) 전용 이미지
                                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src="https://cdn.news.bbsi.co.kr/news/photo/201512/711928_19896_354.jpg"
                                        alt={it.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : it.img ? (
                                // ✅ 일반 여행지/숙소 이미지
                                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src={it.img}
                                        alt={it.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                // ✅ 이미지 없음 처리
                                <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="여행 계획을 불러오는 중입니다..." />
            </div>
        );

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
                                            key={d.dateISO || idx}
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
                                            className="bg-[#2F3E46]"
                                            onClick={handleSave}
                                        >
                                            {planId ? "수정하기" : "저장하기"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* 일정 리스트 */}
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
                                                <Droppable key={dayIdx} droppableId={`day-${dayIdx}`}>
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
                                                                {(d.items || []).map((it, i) =>
                                                                    renderStepItem(it, i, i === d.items.length - 1, dayIdx)
                                                                )}
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ))}
                                        </div>
                                    ) : (
                                        <Droppable droppableId={`day-${activeDayIdx}`}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className="flex flex-col gap-5 p-3 w-[350px]"
                                                >
                                                    {(days[activeDayIdx]?.items || []).map((it, i) =>
                                                        renderStepItem(
                                                            it,
                                                            i,
                                                            i === days[activeDayIdx].items.length - 1,
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
