import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Splitter, Modal, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import HeaderLayout from "@/users/layout/HeaderLayout";
import FooterLayout from "@/users/layout/FooterLayout";
import TravelMap from "./components/TravelMap";
import TitleModal from "@/users/pages/plan/components/TitleModal";
import DateModal from "@/users/pages/plan/components/DateModal";
import { savePlan, updatePlan, getPlanDetail } from "@/common/api/planApi";
import { getCookie } from "@/common/util/cookie";

import PlanSidebar from "@/users/pages/plan/components/scheduler/PlanSidebar";
import PlanDayList from "@/users/pages/plan/components/scheduler/PlanDayList";
import TimeEditModal from "@/users/pages/plan/components/scheduler/TimeEditModal";

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
    const [titleModalOpen, setTitleModalOpen] = useState(false);
    const [dateModalOpen, setDateModalOpen] = useState(false);

    const [stayPlans, setStayPlans] = useState({});
    const [selectedStays, setSelectedStays] = useState([]);

    const initialDayTimes = state?.dayTimes || {};

    const [days, setDays] = useState(state?.days || []);
    const [activeDayIdx, setActiveDayIdx] = useState(-1);
    const [markers, setMarkers] = useState([]);
    const [splitSize, setSplitSize] = useState(80);

    const [timeModalOpen, setTimeModalOpen] = useState(false);
    const [editingDayIdx, setEditingDayIdx] = useState(null);
    const [editingItemIdx, setEditingItemIdx] = useState(null);
    const [tempStart, setTempStart] = useState(null);
    const [tempEnd, setTempEnd] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [openKey, setOpenKey] = useState(null);

    const FALLBACK_IMG = "https://placehold.co/150x150?text=No+Image";
    const DAY_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#F1C40F", "#9B59B6", "#FF8C00", "#8E44AD"];

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId || mode === "create") {
                if (state?.days?.length) setDays((prev) => applyEdgeTimes(prev));
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

    useEffect(() => {
        setSplitSize(activeDayIdx === -1 ? 80 : 40);
    }, [activeDayIdx]);

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
                : (days[activeDayIdx]?.items || [])
                    .map((it, i) => {
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
                    })
                    .filter(Boolean);
        setMarkers(visibleMarkers);
    }, [days, activeDayIdx]);

    const toMinutes = (hhmm) => {
        if (!hhmm || hhmm === "- : -") return null;
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };

    const fmt = (v) => (v && v !== "- : -" ? v : "- : -");

    const getDayEdgeTimes = (dateISO) => {
        const fallback = { start: "10:00", end: "22:00" };
        return initialDayTimes[dateISO] || fallback;
    };

    const applyEdgeTimes = (sourceDays) => {
        return sourceDays.map((d) => {
            if (!d.items?.length) return d;
            const { start, end } = getDayEdgeTimes(d.dateISO);

            return {
                ...d,
                items: d.items.map((it, idx) => {
                    // ✅ 수동 입력된 일정은 절대 자동 세팅 덮어쓰기 금지
                    if (it.__manual__ && it.startTime && it.endTime) {
                        return it;
                    }

                    // ✅ 자동 세팅: 첫 일정과 마지막 일정만 기본값 부여
                    const isFirst = idx === 0;
                    const isLast = idx === d.items.length - 1;
                    return {
                        ...cleanTime(it),
                        startTime: isFirst ? start : isLast ? end : "- : -",
                        endTime: isFirst ? start : isLast ? end : "- : -",
                        __manual__: false,
                    };
                }),
            };
        });
    };

    const cleanTime = (it) => {
        const normalize = (v) => (!v || v === "- : -" ? null : dayjs(v, "HH:mm", true).isValid() ? v : null);
        return { ...it, startTime: normalize(it.startTime), endTime: normalize(it.endTime) };
    };

    const isTimeOrderValid = (items) => {
        // ✅ 시간 지정된 일정만 필터링
        const timed = items.filter(
            (it) => it.startTime && it.startTime !== "--:--" && it.startTime !== "- : -"
        );
        if (timed.length <= 1) return true; // 1개 이하면 항상 OK

        for (let i = 1; i < timed.length; i++) {
            if (timed[i - 1].startTime > timed[i].startTime) return false;
        }
        return true;
    };

    const sortByTime = (items) => {
        const withTime = items.filter((it) => it.startTime && it.startTime !== "- : -").sort((a, b) => a.startTime.localeCompare(b.startTime));
        const noTime = items.filter((it) => !it.startTime || it.startTime === "- : -");
        return [...withTime, ...noTime];
    };

    /** ✅ 수정된 DnD 로직 */
    const handleDragEnd = (result) => {
        if (isViewMode || !result.destination) return;

        // 드래그 시작 전 상태를 백업
        const originalDays = JSON.parse(JSON.stringify(days));

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
                // ✅ 수동 일정 중에서 실제 시간이 지정된 일정이 하나라도 있어야 검사
                const hasRealTime = draft[srcDayIdx].items.some(
                    (it) =>
                        it.__manual__ &&
                        it.startTime &&
                        it.startTime !== "--:--" &&
                        it.startTime !== "- : -"
                );

                if (hasRealTime && !isTimeOrderValid(draft[srcDayIdx].items)) {
                    Modal.confirm({
                        title: "시간 순서 충돌",
                        content: (
                            <>
                                <p>선택한 일정의 이동으로 인해 시간 순서가 깨집니다.</p>
                                <p className="mt-2">
                                    이 일정을 <b>새 위치로 이동시키면서 시간값을 초기화(--:--)</b>
                                    하시겠습니까?
                                </p>
                            </>
                        ),
                        okText: "확인",
                        cancelText: "취소",
                        centered: true,
                        onOk: () => {
                            moved.startTime = "--:--";
                            moved.endTime = "--:--";
                            moved.__manual__ = false;
                            draft[srcDayIdx].items = sortByTime(draft[srcDayIdx].items);
                            setDays([...draft]);
                            message.success("이동된 일정의 시간이 초기화되었습니다.");
                        },
                        onCancel: () => {
                            // ✅ 원래 순서로 완전히 복원
                            setDays(originalDays);
                            message.info("이동이 취소되었습니다.");
                        },
                    });
                    return;
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
                    // ✅ 겹치는 시간 있는 경우 수동 처리만 허용, 자동 세팅 금지
                    Modal.confirm({
                        title: "시간 순서 충돌",
                        content: (
                            <>
                                <p>선택한 일정의 이동으로 인해 시간 순서가 깨집니다.</p>
                                <p className="mt-2">
                                    이 일정을 <b>새 위치로 이동시키면서 시간값을 초기화(--:--)</b>하시겠습니까?
                                </p>
                            </>
                        ),
                        okText: "확인",
                        cancelText: "취소",
                        centered: true,
                        onOk: () => {
                            moved.startTime = "--:--";
                            moved.endTime = "--:--";
                            moved.__manual__ = false;
                            draft[srcDayIdx].items = sortByTime(draft[srcDayIdx].items);
                            setDays([...draft]);
                            message.success("이동된 일정의 시간이 초기화되었습니다.");
                        },
                        onCancel: () => {
                            setDays([...days]); // 복원
                            message.info("이동이 취소되었습니다.");
                        },
                    });
                    return;
                }
            } else {
                // ✅ 수동 시간 있는 일정 덮어쓰기 방지
                if (!draft[srcDayIdx].items.some((it) => it.__manual__)) {
                    draft[srcDayIdx] = applyEdgeTimes([draft[srcDayIdx]])[0];
                }
            }

            if (dstHasManual) {
                if (!isTimeOrderValid(draft[dstDayIdx].items)) {
                    Modal.confirm({
                        title: "시간 순서 충돌",
                        content: (
                            <>
                                <p>선택한 일정의 이동으로 인해 시간 순서가 깨집니다.</p>
                                <p className="mt-2">
                                    이 일정을 <b>새 위치로 이동시키면서 시간값을 초기화(--:--)</b>하시겠습니까?
                                </p>
                            </>
                        ),
                        okText: "확인",
                        cancelText: "취소",
                        centered: true,
                        onOk: () => {
                            moved.startTime = "--:--";
                            moved.endTime = "--:--";
                            moved.__manual__ = false;
                            draft[dstDayIdx].items = sortByTime(draft[dstDayIdx].items);
                            setDays([...draft]);
                            message.success("이동된 일정의 시간이 초기화되었습니다.");
                        },
                        onCancel: () => {
                            setDays([...days]);
                            message.info("이동이 취소되었습니다.");
                        },
                    });
                    return;
                }
            } else {
                draft[dstDayIdx] = applyEdgeTimes([draft[dstDayIdx]])[0];
            }
        }
        setDays(draft);
    };

    /** 일정 카드의 ✏️ 클릭 → 시간 편집 모달 오픈 */
    const onOpenTimeEdit = (dayIdx, index, it) => {
        setEditingDayIdx(dayIdx);
        setEditingItemIdx(index);
        setTempStart(it.startTime && it.startTime !== "- : -" ? dayjs(it.startTime, "HH:mm") : null);
        setTempEnd(it.endTime && it.endTime !== "- : -" ? dayjs(it.endTime, "HH:mm") : null);
        setTimeModalOpen(true);
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
        const items = [...day.items];
        const target = items[editingItemIdx];

        // ✅ 겹침 및 순서 검사
        if (s && e) {
            const sMin = toMinutes(s);
            const eMin = toMinutes(e);
            const others = items
                .map((it, idx) => ({ it, idx }))
                .filter(({ idx }) => idx !== editingItemIdx)
                .filter(({ it }) => it.startTime && it.endTime && it.startTime !== "- : -");

            let prev = null, next = null;
            for (const o of others) {
                const os = toMinutes(o.it.startTime);
                const oe = toMinutes(o.it.endTime);
                if (oe <= sMin) prev = o;
                if (!next && eMin <= os) next = o;
            }

            // ✅ 1. 시간대 겹침 검사
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
                            선택한 시간대 ({s} ~ {e})가 <br />
                            기존 일정 <b>{overlap.it.title}</b>의 시간대
                            <br />
                            ({overlap.it.startTime} ~ {overlap.it.endTime})와 겹칩니다.
                        </>
                    ),
                    centered: true,
                });
                return;
            }

            // ✅ 2. 순서 위반 검사
            const prevEndOk = !prev || toMinutes(prev.it.endTime) <= sMin;
            const nextStartOk = !next || eMin <= toMinutes(next.it.startTime);
            if (!prevEndOk || !nextStartOk) {
                const refTxt = [
                    prev ? `이전 "${prev.it.title}" (${prev.it.startTime}~${prev.it.endTime})` : null,
                    next ? `다음 "${next.it.title}" (${next.it.startTime}~${next.it.endTime})` : null,
                ]
                    .filter(Boolean)
                    .join(", ");
                Modal.warning({
                    title: "시간 순서 오류",
                    content: `선택한 시간대(${s}~${e})가 기존 시간 순서를 깨뜨립니다.\n참고: ${refTxt}`,
                    centered: true,
                });
                return;
            }
        }

        // ✅ 문제 없으면 저장
        items[editingItemIdx] = {
            ...target,
            startTime: s || "--:--",
            endTime: e || "--:--",
            __manual__: !!(s && e),
        };

        // ✅ 시간 순 자동 정렬
        const sorted = [
            ...items
                .filter((x) => x.startTime && x.startTime !== "--:--")
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
            ...items.filter((x) => !x.startTime || x.startTime === "--:--"),
        ];

        newDays[editingDayIdx] = { ...day, items: sorted };
        setDays(newDays);
        setTimeModalOpen(false);
        setEditingDayIdx(null);
        setEditingItemIdx(null);
    };

    // ✅ TimePicker disabledTime 함수
    const getDisabledStartTime = (endTime) => {
        if (!endTime) return {};
        const endHour = endTime.hour();
        const endMinute = endTime.minute();
        return {
            disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h > endHour),
            disabledMinutes: (h) => (h === endHour ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m >= endMinute) : []),
        };
    };

    const getDisabledEndTime = (startTime) => {
        if (!startTime) return {};
        const startHour = startTime.hour();
        const startMinute = startTime.minute();
        return {
            disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h < startHour),
            disabledMinutes: (h) => (h === startHour ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m <= startMinute) : []),
        };
    };

    /** 저장/수정 */
    const handleConfirm = async () => {
        if (isViewMode) return;
        const userCookie = getCookie("userCookie");
        const userId = userCookie?.userId || "navi1";

        const firstTravelImg =
            days.flatMap((d) => d.items).find((it) => it.type === "travel" && it.img && it.img.trim() !== "")
                ?.img || "https://placehold.co/400x300?text=Travel+Plan";

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
                        height: "100%",
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
                            {/* 좌측 사이드바 */}
                            <PlanSidebar
                                days={days}
                                activeDayIdx={activeDayIdx}
                                setActiveDayIdx={setActiveDayIdx}
                                isViewMode={isViewMode}
                                isEditMode={isEditMode}
                                navigate={navigate}
                                meta={meta}
                                state={state}
                                handleConfirm={handleConfirm}
                            />

                            {/* 일정 리스트(스크롤 영역) */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scroll ">
                                <div className=" border-b-2 mb-10">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-semibold text-[#2F3E46] ">
                                            {meta.title || "여행 제목 없음"}
                                        </h2>
                                        {!isViewMode && (
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => setTitleModalOpen(true)}
                                                className="hover:text-[#0A3D91]"
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-base pb-2 border-b-2">
                                        <span>
                                            {meta.startDate} ~ {meta.endDate}
                                        </span>
                                        {!isViewMode && (
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => setDateModalOpen(true)}
                                                className="hover:text-[#0A3D91]"
                                            />
                                        )}
                                    </div>

                                    <div className="text-gray-400 text-sm mt-3 mb-5 ">
                                        * 각 일차 첫 일정은 시작시간, 마지막 일정은 종료시간이 자동 표시됩니다. <br /> * 나머지 일정은 직접 시간을 입력할 수 있습니다.
                                    </div>
                                </div>

                                {/* ✅ 분리된 일정 리스트 + DnD */}
                                <PlanDayList
                                    days={days}
                                    activeDayIdx={activeDayIdx}
                                    isViewMode={isViewMode}
                                    onDragEnd={handleDragEnd}
                                    onEditTime={onOpenTimeEdit}
                                    dayColors={DAY_COLORS}
                                    fallbackImg={FALLBACK_IMG}
                                />
                            </div>
                        </div>
                    </Splitter.Panel>

                    {/* 오른쪽 지도 */}
                    <Splitter.Panel style={{ background: "#fafafa", position: "relative", overflow: "hidden" }}>
                        <TravelMap markers={markers} step={6} />
                    </Splitter.Panel>
                </Splitter>
            </div>

            {/* 시간 설정 모달 */}
            <TimeEditModal
                open={timeModalOpen}
                tempStart={tempStart}
                tempEnd={tempEnd}
                setTempStart={setTempStart}
                setTempEnd={setTempEnd}
                onCancel={() => setTimeModalOpen(false)}
                onSave={handleTimeSave}
                openKey={openKey}
                setOpenKey={setOpenKey}
                selectedPart={selectedPart}
                setSelectedPart={setSelectedPart}
                getDisabledStartTime={getDisabledStartTime}
                getDisabledEndTime={getDisabledEndTime}
            />

            {/* 제목/날짜 모달 */}
            <TitleModal
                open={titleModalOpen}
                title={meta.title || ""}
                setTitle={(newTitle) => setMeta((prev) => ({ ...prev, title: newTitle }))}
                setStep={() => setTitleModalOpen(false)} // 닫기만
                isEditMode={true}
            />

            <DateModal
                open={dateModalOpen}
                onClose={() => setDateModalOpen(false)} // ✅ 모달 닫기 전달
                isEditMode={true}
                meta={meta}
                onDateChange={(newStart, newEnd) => {
                    const start = dayjs(newStart);
                    const end = dayjs(newEnd);
                    const diff = end.diff(start, "day") + 1;

                    // ✅ 기존 날짜 동일할 경우 → 아무 동작 안 함
                    if (meta.startDate === start.format("YYYY-MM-DD") && meta.endDate === end.format("YYYY-MM-DD")) {
                        setDateModalOpen(false);
                        return;
                    }

                    // ✅ 기존 일정 전체
                    const allItems = days.flatMap((d) => d.items);

                    // ✅ 제주공항 일정 추출
                    const jejuArrivals = allItems.filter((it) => it.type === "poi" && it.title?.includes("제주공항 도착"));
                    const jejuDepartures = allItems.filter((it) => it.type === "poi" && it.title?.includes("제주공항 출발"));

                    const arrival =
                        jejuArrivals[0] || {
                            type: "poi",
                            title: "제주공항 도착",
                            icon: "bi bi-airplane",
                            fixed: true,
                            lat: 33.50684612635678,
                            lng: 126.49271493655533,
                            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtda-mfQ8IclFL2JOrafNwY_03skX839tZ60IPclmkut3tH4r7xDFySp8ZOt6tSUaHFvA&usqp=CAU",
                            startTime: "10:00",
                            endTime: "22:00",
                        };

                    const departure =
                        jejuDepartures[0] || {
                            type: "poi",
                            title: "제주공항 출발",
                            icon: "bi bi-airplane",
                            fixed: true,
                            lat: 33.50684612635678,
                            lng: 126.49271493655533,
                            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtda-mfQ8IclFL2JOrafNwY_03skX839tZ60IPclmkut3tH4r7xDFySp8ZOt6tSUaHFvA&usqp=CAU",
                            startTime: "10:00",
                            endTime: "22:00",
                        };

                    // ✅ 일반 여행지만 필터링 (공항 제외)
                    const generalTravels = allItems.filter((it) => it.type === "travel" || it.type === "stay");

                    // ✅ n일 분배
                    const buckets = Array.from({ length: diff }, () => []);
                    generalTravels.forEach((t, idx) => {
                        buckets[idx % diff].push(t);
                    });

                    // ✅ 공항 재배치
                    if (arrival) buckets[0].unshift(arrival);
                    if (departure && diff > 1) buckets[diff - 1].push(departure);

                    // ✅ 새로운 일정 구성
                    const newDays = buckets.map((b, i) => ({
                        dateISO: start.add(i, "day").format("YYYY-MM-DD"),
                        orderNo: i + 1,
                        items: b,
                    }));

                    // ✅ 경고창
                    Modal.confirm({
                        title: "날짜 변경 안내",
                        content: (
                            <>
                                여행 날짜를 <b>{meta.startDate}</b> ~ <b>{meta.endDate}</b>에서
                                <br />
                                <b>{start.format("YYYY-MM-DD")}</b> ~ <b>{end.format("YYYY-MM-DD")}</b>
                                (으)로 변경하시겠습니까?
                                <br />
                                <br />
                                ⚠️ 숙소 정보는 초기화됩니다.
                            </>
                        ),
                        okText: "변경하기",
                        cancelText: "취소",
                        centered: true,
                        onOk: () => {
                            // ✅ 상태 반영
                            setDays(newDays);
                            setMeta((prev) => ({
                                ...prev,
                                startDate: newStart,
                                endDate: newEnd,
                            }));

                            // ✅ 숙소 초기화
                            setStayPlans({});
                            setSelectedStays([]);

                            message.success("여행 날짜가 변경되었습니다. 숙소 정보가 초기화되었습니다.");

                            // ✅ 모달 닫기
                            setDateModalOpen(false);
                        },
                        onCancel: () => {
                            setDateModalOpen(false);
                        },
                    });
                }}
            />

            <FooterLayout />
        </>
    );
}
