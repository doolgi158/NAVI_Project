import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Splitter, Modal, TimePicker, message } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TravelMap from "./components/TravelMap";
import FooterLayout from "@/users/layout/FooterLayout";
import HeaderLayout from "@/users/layout/HeaderLayout";
import { savePlan, updatePlan, getPlanDetail } from "@/common/api/planApi";
import { getCookie } from "@/common/util/cookie";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

/**
 * 기대 입력 (플래너에서 전달):
 * state?.dayTimes = { '2025-10-24': { start: '10:00', end: '22:00' }, ... }
 */
export default function PlanScheduler() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const mode = searchParams.get("mode") || "create";
    const planId = searchParams.get("planId");
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    const [meta, setMeta] = useState({ ...(state?.meta || {}) });

    // 플래너에서 넘어온 일자별 기본 시간 맵(없으면 10~22 기본)
    const initialDayTimes = state?.dayTimes || {};

    const endPickerRef = useRef(null);

    const [days, setDays] = useState(state?.days || []); // [{ dateISO, orderNo, items: [...] }]
    const [activeDayIdx, setActiveDayIdx] = useState(-1);
    const [markers, setMarkers] = useState([]);
    const [splitSize, setSplitSize] = useState(80);

    // 개별 일정 시간 편집 모달
    const [timeModalOpen, setTimeModalOpen] = useState(false);
    const [editingDayIdx, setEditingDayIdx] = useState(null);
    const [editingItemIdx, setEditingItemIdx] = useState(null);
    const [tempStart, setTempStart] = useState(null);
    const [tempEnd, setTempEnd] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [openKey, setOpenKey] = useState(null);

    const FALLBACK_IMG = "https://placehold.co/150x150?text=No+Image";
    const DAY_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#F1C40F", "#9B59B6", "#FF8C00", "#8E44AD"];

    // 서버에서 상세 불러오기(수정/보기 모드)
    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId || mode === "create") {
                if (state?.days?.length) {
                    setDays((prev) => applyEdgeTimes(prev));
                }
                return;
            }
            try {
                const res = await getPlanDetail(planId);
                const data = res?.data;
                if (!data) return;
                setMeta((m) => ({
                    ...m,
                    title: data.title,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    thumbnailPath: data.thumbnailPath,
                }));
                const loaded = (data.days || []).map((d) => ({
                    dateISO: d.dayDate,
                    orderNo: d.orderNo,
                    items: d.items || [],
                }));
                setDays(applyEdgeTimes(loaded));
            } catch (err) {
                console.error("❌ 여행계획 불러오기 실패:", err);
            }
        };
        fetchPlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId, mode]);

    // Splitter 자동 리사이즈
    useEffect(() => {
        setSplitSize(activeDayIdx === -1 ? 80 : 40);
    }, [activeDayIdx]);

    // 지도 마커 갱신
    useEffect(() => {
        if (!days.length) return;
        const extractLatLng = (it) => {
            const lat = parseFloat(it.lat ?? it.latitude ?? it.mapy);
            const lng = parseFloat(it.lng ?? it.longitude ?? it.mapx);
            if (isNaN(lat) || isNaN(lng)) return null;
            return { lat, lng };
        };
        const visibleMarkers =
            activeDayIdx === -1
                ? days.flatMap((d, dayIdx) =>
                    d.items
                        .map((it, i) => {
                            const pos = extractLatLng(it);
                            if (!pos) return null;
                            return {
                                type: it.type,
                                title: it.title,
                                latitude: pos.lat,
                                longitude: pos.lng,
                                order: i + 1,
                                dayIdx,
                                color: DAY_COLORS[dayIdx % DAY_COLORS.length],
                            };
                        })
                        .filter(Boolean)
                )
                : (days[activeDayIdx]?.items || []).map((it, i) => {
                    const pos = extractLatLng(it);
                    if (!pos) return null;
                    return {
                        type: it.type,
                        title: it.title,
                        latitude: pos.lat,
                        longitude: pos.lng,
                        order: i + 1,
                        dayIdx: activeDayIdx,
                        color: DAY_COLORS[activeDayIdx % DAY_COLORS.length],
                    };
                }).filter(Boolean);
        setMarkers(visibleMarkers);
    }, [days, activeDayIdx]);

    // ⏱ 문자열 "HH:mm" → 분(min) 변환
    const toMinutes = (hhmm) => {
        if (!hhmm || hhmm === "- : -") return null;
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };

    // "HH:mm" 포맷 보정
    const fmt = (v) => (v && v !== "- : -" ? v : "- : -");

    /** 일자별 기본 시간 조회 */
    const getDayEdgeTimes = (dateISO) => {
        const fallback = { start: "10:00", end: "22:00" };
        return initialDayTimes[dateISO] || fallback;
    };

    /** 규칙1: 각 일자 첫/마지막만 시간 세팅, 그 외는 "- : -" */
    const applyEdgeTimes = (sourceDays) => {
        return sourceDays.map((d) => {
            if (!d.items?.length) return d;
            const { start, end } = getDayEdgeTimes(d.dateISO);
            return {
                ...d,
                items: d.items.map((it, idx) => ({
                    ...cleanTime(it),
                    startTime: idx === 0 ? start : idx === d.items.length - 1 ? end : "- : -",
                    endTime: idx === 0 ? start : idx === d.items.length - 1 ? end : "- : -",
                    __manual__: false,
                })),
            };
        });
    };

    /** 수동 입력 시 혼재 방지용 정규화 */
    const cleanTime = (it) => {
        const normalize = (v) => (!v || v === "- : -" ? null : dayjs(v, "HH:mm", true).isValid() ? v : null);
        return {
            ...it,
            startTime: normalize(it.startTime),
            endTime: normalize(it.endTime),
        };
    };

    /** 리스트가 시간순인지 검사(수동 시간 있는 경우) */
    const isTimeOrderValid = (items) => {
        const timed = items
            .map((it, idx) => ({ idx, t: it.startTime }))
            .filter((x) => x.t && x.t !== "- : -");
        for (let i = 1; i < timed.length; i++) {
            if (timed[i - 1].t > timed[i].t) return false;
        }
        return true;
    };

    /** 시간 기준 정렬: 시간 있는 항목 오름차순, 나머지 뒤 */
    const sortByTime = (items) => {
        const withTime = items
            .map((it, i) => ({ it, i }))
            .filter(({ it }) => it.startTime && it.startTime !== "- : -")
            .sort((a, b) => a.it.startTime.localeCompare(b.it.startTime));
        const noTime = items
            .map((it, i) => ({ it, i }))
            .filter(({ it }) => !it.startTime || it.startTime === "- : -");
        return [...withTime.map((x) => x.it), ...noTime.map((x) => x.it)];
    };

    /** DnD 끝났을 때 */
    const handleDragEnd = (result) => {
        if (isViewMode || !result.destination) return;
        const srcDayIdx = parseInt(result.source.droppableId.split("-")[1]);
        const dstDayIdx = parseInt(result.destination.droppableId.split("-")[1]);

        const draft = [...days];
        const take = draft[srcDayIdx].items.slice();
        const [moved] = take.splice(result.source.index, 1);

        if (srcDayIdx === dstDayIdx) {
            take.splice(result.destination.index, 0, moved);
            draft[srcDayIdx].items = take;
            const hasManual = draft[srcDayIdx].items.some((it) => it.__manual__ && it.startTime && it.startTime !== "- : -");
            if (hasManual) {
                if (!isTimeOrderValid(draft[srcDayIdx].items)) {
                    draft[srcDayIdx].items = sortByTime(draft[srcDayIdx].items);
                    message.info("시간이 지정된 일차는 시간순으로 유지됩니다.");
                }
            } else {
                draft[srcDayIdx] = applyEdgeTimes([draft[srcDayIdx]])[0];
            }
        } else {
            const to = draft[dstDayIdx].items.slice();
            to.splice(result.destination.index, 0, moved);
            draft[srcDayIdx].items = take;
            draft[dstDayIdx].items = to;

            const srcHasManual = draft[srcDayIdx].items.some((it) => it.__manual__ && it.startTime && it.startTime !== "- : -");
            const dstHasManual = draft[dstDayIdx].items.some((it) => it.__manual__ && it.startTime && it.startTime !== "- : -");

            if (srcHasManual) {
                if (!isTimeOrderValid(draft[srcDayIdx].items)) {
                    draft[srcDayIdx].items = sortByTime(draft[srcDayIdx].items);
                    message.info("시간이 지정된 일차는 시간순으로 유지됩니다.");
                }
            } else {
                draft[srcDayIdx] = applyEdgeTimes([draft[srcDayIdx]])[0];
            }

            if (dstHasManual) {
                if (!isTimeOrderValid(draft[dstDayIdx].items)) {
                    draft[dstDayIdx].items = sortByTime(draft[dstDayIdx].items);
                    message.info("시간이 지정된 일차는 시간순으로 유지됩니다.");
                }
            } else {
                draft[dstDayIdx] = applyEdgeTimes([draft[dstDayIdx]])[0];
            }
        }
        setDays(draft);
    };

    /** 일정 카드 렌더 */
    const renderStepItem = (it, i, isLast, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const imageSrc = it.img || FALLBACK_IMG;

        return (
            <Draggable key={`${dayIdx}-${i}-${it.title}-${i}`} draggableId={`${dayIdx}-${i}-${it.title}-${i}`} index={i} isDragDisabled={isViewMode}>
                {(prov, snapshot) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`relative pl-8 pb-6 transition-all ${snapshot.isDragging ? "scale-[1.02]" : ""}`}>
                        {!isLast && (
                            <div className="absolute top-5 left-[13px] w-[2px] h-[calc(100%-0.5rem)] z-0" style={{ backgroundColor: color }}></div>
                        )}
                        <div className="absolute left-0 top-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-semibold z-10 bg-white" style={{ borderColor: color, color }}>
                            {i + 1}
                        </div>
                        <div className="ml-2 flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>
                                        {(it.startTime && it.startTime !== "- : -") ? it.startTime : "- : -"} ~ {(it.endTime && it.endTime !== "- : -") ? it.endTime : "- : -"}
                                    </span>
                                    {!isViewMode && (
                                        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => {
                                            setEditingDayIdx(dayIdx);
                                            setEditingItemIdx(i);
                                            setTempStart(it.startTime && it.startTime !== "- : -" ? dayjs(it.startTime, "HH:mm") : null);
                                            setTempEnd(it.endTime && it.endTime !== "- : -" ? dayjs(it.endTime, "HH:mm") : null);
                                            setTimeModalOpen(true);
                                        }} />
                                    )}
                                </div>
                                <span className={`text-xs font-semibold ${it.type === "stay" ? "text-[#6846FF]" : it.type === "travel" ? "text-[#0088CC]" : "text-gray-400"}`}>
                                    {it.type === "stay" ? "숙소" : it.type === "travel" ? "여행지" : "기타"}
                                </span>
                                <span className="font-semibold text-[#2F3E46] text-sm truncate max-w-[160px]" title={it.title}>{it.title}</span>
                            </div>
                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ">
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

    /** 개별 일정 시간 저장 (검증 + 자동 정렬) */
    const handleTimeSave = () => {
        if (editingDayIdx == null || editingItemIdx == null) return;

        const s = tempStart ? tempStart.format("HH:mm") : null;
        const e = tempEnd ? tempEnd.format("HH:mm") : null;

        if ((s && !e) || (!s && e)) {
            Modal.warning({
                title: "시간 입력 오류",
                content: "시작·종료 시간을 모두 지정하거나 모두 비워주세요.",
                centered: true,
            });
            return;
        }

        if (s && e && e < s) {
            Modal.warning({
                title: "시간 설정 오류",
                content: "종료시간은 시작시간 이후여야 합니다.",
                centered: true,
            });
            return;
        }

        const newDays = [...days];
        const day = newDays[editingDayIdx];
        const items = day.items.slice();
        const target = items[editingItemIdx];

        if (s && e) {
            const sMin = toMinutes(s);
            const eMin = toMinutes(e);
            const others = items
                .map((it, idx) => ({ it, idx }))
                .filter(({ idx }) => idx !== editingItemIdx)
                .filter(({ it }) => it.startTime && it.endTime && it.startTime !== "--:--")
                .sort((a, b) => a.it.startTime.localeCompare(b.it.startTime));

            let prev = null, next = null;
            for (const o of others) {
                const os = toMinutes(o.it.startTime);
                const oe = toMinutes(o.it.endTime);
                if (oe <= sMin) prev = o;
                if (!next && eMin <= os) next = o;
            }

            const overlap = others.find(({ it }) => {
                const os = toMinutes(it.startTime);
                const oe = toMinutes(it.endTime);
                return Math.max(sMin, os) < Math.min(eMin, oe);
            });

            if (overlap) {
                Modal.warning({
                    title: "시간 겹침",
                    content: (
                        <>
                            선택한 시간대({s}~{e})가<br />
                            기존 일정 <b>{overlap.it.title}</b>의 시간대<br />
                            ({fmt(overlap.it.startTime)}~{fmt(overlap.it.endTime)})와 겹칩니다.
                        </>
                    ),
                    centered: true,
                });
                return;
            }

            const prevEndOk = !prev || toMinutes(prev.it.endTime) <= sMin;
            const nextStartOk = !next || eMin <= toMinutes(next.it.startTime);
            if (!prevEndOk || !nextStartOk) {
                const refTxt = [
                    prev ? `이전 "${prev.it.title}" (${fmt(prev.it.startTime)}~${fmt(prev.it.endTime)})` : null,
                    next ? `다음 "${next.it.title}" (${fmt(next.it.startTime)}~${fmt(next.it.endTime)})` : null,
                ].filter(Boolean).join(", ");
                Modal.warning({
                    title: "시간 순서 오류",
                    content: `선택한 시간대(${s}~${e})가 기존 시간 순서를 깨뜨립니다. 참고: ${refTxt}`,
                    centered: true,
                });
                return;
            }
        }

        items[editingItemIdx] = { ...target, startTime: s || "--:--", endTime: e || "--:--", __manual__: !!(s && e) };
        const sorted = [
            ...items.filter((x) => x.startTime && x.startTime !== "--:--").sort((a, b) => a.startTime.localeCompare(b.startTime)),
            ...items.filter((x) => !x.startTime || x.startTime === "--:--"),
        ];
        newDays[editingDayIdx] = { ...day, items: sorted };
        setDays(newDays);
        setTimeModalOpen(false);
        setEditingDayIdx(null);
        setEditingItemIdx(null);
    };

    // ✅ TimePicker disabledTime 함수 외부 정의
    const getDisabledStartTime = (endTime) => {
        if (!endTime) return {};
        const endHour = endTime.hour();
        const endMinute = endTime.minute();
        return {
            disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h > endHour),
            disabledMinutes: (h) => h === endHour ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m >= endMinute) : [],
        };
    };

    const getDisabledEndTime = (startTime) => {
        if (!startTime) return {};
        const startHour = startTime.hour();
        const startMinute = startTime.minute();
        return {
            disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h < startHour),
            disabledMinutes: (h) => h === startHour ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m <= startMinute) : [],
        };
    };

    /** 저장/수정 */
    const handleConfirm = async () => {
        if (isViewMode) return;
        const userCookie = getCookie("userCookie");
        const userId = userCookie?.userId || "navi1";

        const firstTravelImg = days.flatMap((d) => d.items).find((it) => it.type === "travel" && it.img && it.img.trim() !== "")?.img
            || "https://placehold.co/400x300?text=Travel+Plan";

        const requestData = {
            title: meta.title || "새 여행 계획",
            startDate: meta.startDate,
            endDate: meta.endDate,
            thumbnailPath: firstTravelImg,
            days: days.map((d, idx) => ({
                dayDate: d.dateISO,
                orderNo: idx + 1,
                items: d.items.map((it) => ({
                    title: it.title,
                    type: it.type,
                    travelId: it.travelId ?? null,
                    stayId: typeof it.stayId === "string" ? Number(it.stayId.replace(/[^\d]/g, "")) : it.stayId ?? null,
                    lat: it.lat ?? it.latitude ?? it.mapy ?? null,
                    lng: it.lng ?? it.longitude ?? it.mapx ?? null,
                    img: it.img && it.img.trim() !== "" ? it.img : "https://placehold.co/150x150?text=No+Image",
                    startTime: it.startTime && it.startTime !== "- : -" ? it.startTime : null,
                    endTime: it.endTime && it.endTime !== "- : -" ? it.endTime : null,
                })),
            })),
        };

        try {
            if (isEditMode && planId) {
                await updatePlan(planId, requestData);
                Modal.success({ title: "수정 완료", content: "여행 계획이 성공적으로 수정되었습니다.", centered: true });
            } else {
                await savePlan(requestData);
                Modal.success({ title: "저장 완료", content: "여행 계획이 성공적으로 저장되었습니다.", centered: true });
            }
            navigate("/plans");
        } catch (err) {
            console.error("❌ 저장 중 오류:", err);
            Modal.error({ title: "저장 실패", content: "여행 계획 저장 중 오류가 발생했습니다.", centered: true });
        }
    };

    return (
        <>
            <HeaderLayout />
            <div className="w-full h-screen bg-gray-50 overflow-hidden flex flex-col custom-scroll">
                <Splitter
                    style={{
                        borderTop: "1px solid #eee",
                        transition: "all 0.4s ease-in-out",
                        height: "100%", // ✅ Splitter가 화면 전체 차지
                    }}
                    min="20%"
                    max="80%"
                    size={splitSize}
                >
                    {/* 왼쪽 일정 패널 */}
                    <Splitter.Panel
                        style={{
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                        }}
                    >
                        <div className="flex flex-1">
                            {/* 왼쪽 버튼 영역 */}
                            <div className="w-28 border-r p-4 flex flex-col justify-between bg-gray-50">
                                <div className="space-y-2  mt-5">
                                    <Button block type={activeDayIdx === -1 ? "primary" : "default"} onClick={() => setActiveDayIdx(-1)}>
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
                                        <Button block type="primary" className="bg-[#2F3E46] mt-2" onClick={handleConfirm}>
                                            {isEditMode ? "수정" : "저장"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* ✅ 일정 리스트 (이곳만 스크롤 가능) */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scroll">
                                <div className="pb-6 bg-white sticky top-0 z-10">
                                    <h2 className="text-xl font-semibold text-[#2F3E46]">{meta.title || "전체 일정"}</h2>
                                    <div className="text-gray-500 text-sm">
                                        {meta.startDate} ~ {meta.endDate}
                                    </div>
                                    <div className="text-gray-600 text-sm mt-1">
                                        * 각 일차 첫 일정은 시작시간, 마지막 일정은 종료시간이 자동 표시됩니다. 중간은 빈값입니다.
                                    </div>
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    {activeDayIdx === -1 ? (
                                        <div className="flex gap-12 overflow-x-auto px-4 custom-scroll">
                                            {days.map((d, dayIdx) => (
                                                <Droppable key={dayIdx} droppableId={`day-${dayIdx}`} isDropDisabled={isViewMode}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col min-w-[300px] relative">
                                                            <h3 className="text-lg font-semibold text-[#2F3E46] mb-4 border-b pb-1">
                                                                {dayIdx + 1}일차 <span className="text-gray-400 text-sm">{d.dateISO}</span>
                                                            </h3>
                                                            <div className="relative">
                                                                {d.items.map((it, i) => renderStepItem(it, i, i === d.items.length - 1, dayIdx))}
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ))}
                                        </div>
                                    ) : (
                                        <Droppable droppableId={`day-${activeDayIdx}`} isDropDisabled={isViewMode}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-5 p-3 w-[380px]">
                                                    {days[activeDayIdx]?.items.map((it, i) =>
                                                        renderStepItem(it, i, i === days[activeDayIdx].items.length - 1, activeDayIdx)
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


                    <Splitter.Panel style={{ background: "#fafafa", position: "relative", overflow: "hidden" }}>
                        <TravelMap markers={markers} step={6} />
                    </Splitter.Panel>
                </Splitter>
            </div>


            <Modal
                title="일정 시간 설정"
                open={timeModalOpen}
                onCancel={() => setTimeModalOpen(false)}
                onOk={handleTimeSave}
                okText="저장"
                cancelText="취소"
                centered
            >
                <div className="flex items-center gap-3 justify-center py-2">
                    {/* ✅ 시/분 선택 추적용 상태 */}
                    {/* 이 부분은 Modal 컴포넌트 상단(useState 영역)에 추가하세요 */}
                    {/* const [openKey, setOpenKey] = useState(null); */}
                    {/* const [selectedPart, setSelectedPart] = useState(null); */}

                    {/* 시작시간 */}
                    <TimePicker
                        format="HH:mm"
                        minuteStep={5}
                        showNow={false}
                        needConfirm={false}
                        value={tempStart}
                        open={openKey === "start"}
                        onOpenChange={(open) => {
                            if (open) {
                                setSelectedPart(null);
                                setOpenKey("start");
                            } else {
                                setOpenKey(null);
                            }
                        }}
                        onSelect={(v) => {
                            if (selectedPart === null) {
                                // 첫 번째 선택(시)
                                setSelectedPart("hour");
                                setTempStart(v);
                            } else if (selectedPart === "hour") {
                                // 두 번째 선택(분)
                                setTempStart(v);
                                setSelectedPart(null);
                                setOpenKey(null); // ✅ 시+분 모두 선택 후 자동 닫기
                                // 종료시간 선택창으로 자동 포커스 이동
                                setTimeout(() => {
                                    if (endPickerRef.current) endPickerRef.current.focus();
                                }, 150);
                            }
                        }}
                        onChange={(v) => setTempStart(v)}
                        placeholder="시작"
                        disabledTime={() => getDisabledStartTime(tempEnd)}
                    />

                    <span>~</span>

                    {/* 종료시간 */}
                    <TimePicker
                        ref={endPickerRef}
                        format="HH:mm"
                        minuteStep={5}
                        showNow={false}
                        needConfirm={false}
                        value={tempEnd}
                        open={openKey === "end"}
                        onOpenChange={(open) => {
                            if (open) {
                                setSelectedPart(null);
                                setOpenKey("end");
                            } else {
                                setOpenKey(null);
                            }
                        }}
                        onSelect={(v) => {
                            if (selectedPart === null) {
                                setSelectedPart("hour");
                                setTempEnd(v);
                            } else if (selectedPart === "hour") {
                                setTempEnd(v);
                                setSelectedPart(null);
                                setOpenKey(null); // ✅ 시+분 모두 선택 후 자동 닫기
                            }
                        }}
                        onChange={(v) => setTempEnd(v)}
                        placeholder="종료"
                        disabledTime={() => getDisabledEndTime(tempStart)}
                    />
                </div>

                <div className="text-xs text-gray-500 text-center mt-2">
                    둘 다 비우면 시간 미지정으로 처리되어 정렬 대상에서 제외됩니다.
                </div>
            </Modal>


            <FooterLayout />
        </>
    );
}
