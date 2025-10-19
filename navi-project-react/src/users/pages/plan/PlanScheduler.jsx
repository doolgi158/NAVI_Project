import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Splitter, Steps } from "antd";
import { HomeOutlined, EnvironmentOutlined, CarOutlined, } from "@ant-design/icons";
import TravelMap from "./components/TravelMap";
import FooterLayout from "@/users/layout/FooterLayout";
import HeaderLayout from "@/users/layout/HeaderLayout";

export default function PlanScheduler() {
    const { state } = useLocation(); // { meta, days }
    const navigate = useNavigate();
    const meta = state?.meta || {};
    const days = state?.days || [];
    const [activeDayIdx, setActiveDayIdx] = useState(0); // -1: 전체일정 보기

    // ✅ 지도 마커 (전체일정 모드일 경우 모든 일정 포함)
    const markers = useMemo(() => {
        if (activeDayIdx === -1) {
            return days
                .flatMap((d) => d.items)
                .filter(
                    (it) =>
                        (it.type === "travel" || it.type === "stay") &&
                        !Number.isNaN(it.lat) &&
                        !Number.isNaN(it.lng)
                )
                .map((it, i) => ({
                    type: it.type === "stay" ? "stay" : "travel",
                    title: it.title,
                    latitude: it.lat,
                    longitude: it.lng,
                    order: i + 1,
                }));
        }

        const d = days[activeDayIdx];
        if (!d) return [];
        return (d.items || [])
            .filter(
                (it) =>
                    (it.type === "travel" || it.type === "stay") &&
                    !Number.isNaN(it.lat) &&
                    !Number.isNaN(it.lng)
            )
            .map((it, i) => ({
                type: it.type === "stay" ? "stay" : "travel",
                title: it.title,
                latitude: it.lat,
                longitude: it.lng,
                order: i + 1,
            }));
    }, [days, activeDayIdx]);

    const handleSaveAll = () => {
        // TODO: DB 저장 로직 (savePlan 등)
        navigate("/plans");
    };

    return (
        <>
            <HeaderLayout />
            <div className=" w-full bg-gray-50">


                {/* ✅ Splitter로 좌/우 조절 */}
                <Splitter
                    style={{
                        height: "calc(100vh - 100px)",
                        borderTop: "1px solid #eee",
                    }}
                    min="20%"
                    max="80%"
                    defaultSize="80%"
                >
                    {/* 왼쪽 일정 편집 영역 */}
                    <Splitter.Panel
                        style={{
                            background: "#fff",
                            overflowY: "auto",
                            borderRight: "1px solid #eee",
                        }}
                    >
                        <div className="flex h-full">
                            {/* 왼쪽 사이드바 */}
                            <div className="w-28 border-r p-4 mt-5 flex flex-col justify-between bg-gray-50">
                                {/* 상단 - 일자 선택 버튼 */}
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

                                {/* 하단 - 편집 & 저장 버튼 */}
                                <div className="pt-6 flex flex-col">
                                    <Button
                                        block
                                        className="border-gray-300 text-[#2F3E46]"
                                        onClick={() => navigate("/plans/edit")}
                                    >
                                        편집
                                    </Button>

                                    <Button
                                        block
                                        type="primary"
                                        className="bg-[#2F3E46] mt-2"
                                        onClick={handleSaveAll}
                                    >
                                        저장
                                    </Button>
                                </div>
                            </div>

                            {/* 오른쪽 일정 내용 */}
                            <div className="flex-1 p-10 overflow-y-auto">

                                {/* 상단 정보 */}
                                <div className="pb-10 bg-white ">
                                    <h2 className="text-xl font-semibold text-[#2F3E46]">
                                        {meta.title || "일정 편집"}
                                        <span className="text-gray-500 text-sm p-5">
                                            {meta.startDate} ~ {meta.endDate}
                                        </span>
                                    </h2>

                                </div>

                                {/* ✅ 전체 일정 보기 모드 */}
                                {activeDayIdx === -1 ? (
                                    <>
                                        <div className="flex gap-6 items-stretch overflow-x-auto h-[calc(100vh-220px)]">
                                            {days.map((d, idx) => (
                                                <div
                                                    key={d.dateISO}
                                                    className="flex-1 min-w-[250px] bg-white  rounded-lg flex flex-col shadow-sm"
                                                >
                                                    {/* 상단 제목 */}
                                                    <div className="text-lg font-semibold mb-2 text-[#2F3E46] px-3 py-2 text-left">
                                                        {idx + 1}일차 <span className="text-gray-400 ml-3 text-sm text-right">{d.dateISO}</span>
                                                    </div>

                                                    {/* 일정 Steps (AntD vertical mini) */}
                                                    <div className="flex-1 overflow-y-auto px-4 py-3">
                                                        {d.items && d.items.length > 0 ? (
                                                            <Steps
                                                                direction="vertical"
                                                                size="small"
                                                                current={-1}
                                                                items={d.items.map((it, i) => ({
                                                                    title: (
                                                                        <div className="flex flex-col gap-1 mb-6">
                                                                            {/* ⏰ 시간 */}
                                                                            <span className="text-xs text-gray-500 mb-1">
                                                                                {it.startTime && it.endTime
                                                                                    ? `${it.startTime} ~ ${it.endTime}`
                                                                                    : "시간 미정"}
                                                                            </span>

                                                                            {/* 🏞️ 콘텐츠 */}
                                                                            <div className="flex items-center justify-between gap-3 w-full">
                                                                                {/* 왼쪽: 제목 및 부가정보 */}
                                                                                <div className="flex-1 w-32">
                                                                                    <span
                                                                                        className="text-sm font-medium text-[#2F3E46] leading-tight block truncate"
                                                                                        title={it.title}
                                                                                    >
                                                                                        {it.title}
                                                                                    </span>
                                                                                    {it.type === "stay" && (
                                                                                        <span className="text-xs text-[#6846FF] leading-tight">숙소</span>
                                                                                    )}
                                                                                    {it.type === "travel" && (
                                                                                        <span className="text-xs text-[#0088CC] leading-tight">여행지</span>
                                                                                    )}
                                                                                    {it.fixed && (
                                                                                        <span className="text-xs text-gray-400 leading-tight">(고정)</span>
                                                                                    )}
                                                                                </div>

                                                                                {/* 오른쪽: 이미지 썸네일 */}
                                                                                {it.img && (
                                                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                                                        <img
                                                                                            src={it.img}
                                                                                            alt={it.title}
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ),

                                                                    // ✅ 각 Step의 동그라미 아이콘 (기본 번호 스타일)
                                                                    icon: (
                                                                        <div
                                                                            className={"flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full border-2 border-[#6846FF] text-[#6846FF]"}
                                                                        >
                                                                            {i + 1}
                                                                        </div>
                                                                    ),
                                                                }))}
                                                            />

                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm border rounded-md p-5">
                                                                일정 없음
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* ✅ 단일 일자 보기 */}
                                        <h3 className="text-lg font-semibold text-[#2F3E46] mb-6">
                                            {activeDayIdx + 1}일차
                                            <span className="text-gray-400 text-sm ml-3">
                                                {days[activeDayIdx]?.dateISO}
                                            </span>
                                        </h3>

                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            {days[activeDayIdx]?.items &&
                                                days[activeDayIdx].items.length > 0 ? (
                                                <Steps
                                                    direction="vertical"
                                                    size="small"
                                                    current={-1}
                                                    items={days[activeDayIdx].items.map((it, i) => ({
                                                        title: (
                                                            <div className="flex flex-col gap-1 mb-6">
                                                                {/* ⏰ 시간 */}
                                                                <span className="text-xs text-gray-500 mb-1">
                                                                    {it.startTime && it.endTime
                                                                        ? `${it.startTime} ~ ${it.endTime}`
                                                                        : "시간 미정"}
                                                                </span>

                                                                {/* 🏞️ 콘텐츠 */}
                                                                <div className="flex items-center justify-between gap-3 w-full">
                                                                    {/* 왼쪽: 제목 및 부가정보 */}
                                                                    <div className="flex-1 w-32">
                                                                        <span
                                                                            className="text-sm font-medium text-[#2F3E46] leading-tight block truncate"
                                                                            title={it.title}
                                                                        >
                                                                            {it.title}
                                                                        </span>
                                                                        {it.type === "stay" && (
                                                                            <span className="text-xs text-[#6846FF] leading-tight">
                                                                                숙소
                                                                            </span>
                                                                        )}
                                                                        {it.type === "travel" && (
                                                                            <span className="text-xs text-[#0088CC] leading-tight">
                                                                                여행지
                                                                            </span>
                                                                        )}
                                                                        {it.fixed && (
                                                                            <span className="text-xs text-gray-400 leading-tight">
                                                                                (고정)
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* 오른쪽: 이미지 썸네일 */}
                                                                    {it.img && (
                                                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                                            <img
                                                                                src={it.img}
                                                                                alt={it.title}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                        icon: (
                                                            <div
                                                                className={`flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full border-2 ${it.type === "stay"
                                                                    ? "border-[#6846FF] text-[#6846FF]"
                                                                    : it.type === "travel"
                                                                        ? "border-[#2F3E46] text-[#2F3E46]"
                                                                        : "border-gray-400 text-gray-400"
                                                                    }`}
                                                            >
                                                                {i + 1}
                                                            </div>
                                                        ),
                                                    }))}
                                                />
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center py-10">
                                                    이 날의 일정이 없습니다.
                                                </p>
                                            )}
                                        </div>

                                    </>
                                )}
                            </div>
                        </div>
                    </Splitter.Panel>

                    {/* 오른쪽 지도 영역 */}
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
