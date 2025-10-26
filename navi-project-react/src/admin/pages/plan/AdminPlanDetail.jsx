import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button, Spin, message, Splitter } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import api from "@/common/api/naviApi";

import HeaderLayout from "@/users/layout/HeaderLayout";
import FooterLayout from "@/users/layout/FooterLayout";
import PlanSidebar from "@/users/pages/plan/components/scheduler/PlanSidebar";
import PlanDayList from "@/users/pages/plan/components/scheduler/PlanDayList";
import TravelMap from "@/users/pages/plan/components/TravelMap";

const { Content } = Layout;

export default function AdminPlanDetail() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDayIdx, setActiveDayIdx] = useState(-1);
    const [splitSize, setSplitSize] = useState(70);
    const [markers, setMarkers] = useState([]);

    const FALLBACK_IMG = "https://placehold.co/150x150?text=No+Image";
    const DAY_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#F1C40F", "#9B59B6", "#FF8C00", "#8E44AD"];

    /** ✅ 상세 데이터 불러오기 */
    const fetchPlanDetail = async () => {
        try {
            const res = await api.get(`/adm/plan/${planId}`);
            const data = res.data;
            setPlan(data);

            // 날짜별 아이템 구성
            const mapped = (data.days || []).map((d, idx) => ({
                dateISO: d.date,
                orderNo: idx + 1,
                items: (d.items || []).map((it) => ({
                    ...it,
                    img:
                        it.img?.trim() ||
                        it.accImage?.trim() ||
                        it.imagePath?.trim() ||
                        it.thumbnailPath?.trim() ||
                        `${API_SERVER_HOST}/images/common/default_acc.jpg`,
                    startTime: it.startTime || "--:--",
                    endTime: it.endTime || "--:--",
                })),
            }));
            setDays(mapped);
        } catch (err) {
            console.error("❌ 관리자 상세 조회 실패:", err);
            message.error("데이터를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanDetail();
    }, [planId]);

    /** ✅ 지도 마커 설정 */
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

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <Spin size="large" />
            </div>
        );

    return (
        <>
            <HeaderLayout />
            <div className="w-full h-screen bg-gray-50 overflow-hidden flex flex-col">
                {/* 상단 제목 */}
                <div className="flex justify-between items-center bg-white border-b px-8 py-4 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0A3D91]">
                            여행계획 상세보기 (관리자)
                        </h2>
                        <div className=" mt-2 flex flex-col">
                            {/* 🟢 수정: plan?.createdAt 옵셔널 체이닝 적용 */}
                            <p className="text-gray-500 text-sm mb-2">
                                등록일: {plan?.createdAt?.replace("T", " ").substring(0, 16) || '-'}
                            </p>
                            {/* 🟢 수정: plan?.updatedAt 옵셔널 체이닝 적용 */}
                            <p className="text-gray-500 text-sm mb-2">
                                수정일:{" "}
                                {plan?.updatedAt
                                    ? plan.updatedAt.replace("T", " ").substring(0, 16)
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 본문 Splitter 레이아웃 */}
                <Splitter
                    style={{
                        height: "100%",
                        borderTop: "1px solid #eee",
                        transition: "all 0.3s ease-in-out",
                    }}
                    min="25%"
                    max="75%"
                    size={splitSize}
                    onChange={setSplitSize}
                    primary="first"
                >
                    {/* ✅ 좌측: 일정 패널 */}
                    <Splitter.Panel
                        style={{
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "200px 1fr",
                                height: "100%",
                                overflow: "hidden",
                            }}
                        >
                            {/* 좌측 사이드바 */}
                            <PlanSidebar
                                days={days}
                                activeDayIdx={activeDayIdx}
                                setActiveDayIdx={setActiveDayIdx}
                                isViewMode={false}
                                isEditMode={false}
                                isAdminView={true}
                            />

                            {/* 우측 일정 리스트 */}
                            <div
                                className="overflow-y-auto px-10 py-8 custom-scroll"
                                style={{ height: "100%", background: "#fafafa" }}
                            >
                                <div className="border-b-2 mb-8">
                                    {/* 🟢 수정: plan?.title 옵셔널 체이닝 적용 */}
                                    <h3 className="text-2xl font-semibold text-[#2F3E46] mb-1">
                                        {plan?.title || "제목 없음"}
                                    </h3>
                                    {/* 🟢 수정: plan?.name, plan?.id, plan?.startDate, plan?.endDate 옵셔널 체이닝 적용 */}
                                    <p className="text-gray-600 text-sm mt-4 mb-2">
                                        작성자: {plan?.name} ({plan?.id}) | 여행일정: {plan?.startDate} ~ {plan?.endDate}
                                    </p>
                                </div>

                                <PlanDayList
                                    days={days}
                                    activeDayIdx={activeDayIdx}
                                    isViewMode={true}
                                    onDragEnd={() => { }}
                                    onEditTime={() => { }}
                                    dayColors={DAY_COLORS}
                                    fallbackImg={FALLBACK_IMG}
                                    setDays={() => { }}
                                />
                            </div>
                        </div>
                    </Splitter.Panel>

                    {/* ✅ 우측: 지도 영역 */}
                    <Splitter.Panel
                        style={{
                            background: "#fefefe",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <TravelMap markers={markers} step={6} />
                    </Splitter.Panel>
                </Splitter>
            </div >
            <FooterLayout />
        </>
    );
}