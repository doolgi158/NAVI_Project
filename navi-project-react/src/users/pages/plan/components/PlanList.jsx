import React from "react";
import { Card, Button, Dropdown, Spin, Pagination } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    isBefore,
    isAfter,
    isSameDay,
    isWithinInterval,
    startOfDay,
    differenceInDays,
    format,
} from "date-fns";

/**
 * ✅ 여행계획 리스트
 * - 리스트 클릭 시 상세보기
 * - 우측 상단 메뉴(...)로 수정/삭제
 * - 완료된 여행은 수정 버튼 미표시
 */
export default function PlanList({
    plans = [],
    loading = false,
    showPagination = false,
    currentPage = 1,
    pageSize = 5,
    onPageChange = () => { },
    onDetail,
    onEdit,
    onDelete,
}) {
    const today = startOfDay(new Date());
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedList = showPagination ? plans.slice(startIdx, endIdx) : plans;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return format(new Date(dateStr), "yy.MM.dd");
        } catch {
            return dateStr;
        }
    };

    return (
        <Card className="w-[900px] rounded-2xl shadow-sm border-none">
            {loading ? (
                <div className="text-center py-10">
                    <Spin fullscreen tip="여행 데이터를 불러오는 중입니다..." />
                </div>
            ) : paginatedList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    등록된 여행이 없습니다.
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-5">
                        {paginatedList.map((plan) => {
                            const start = startOfDay(new Date(plan.startDate));
                            const end = startOfDay(new Date(plan.endDate));

                            // ✅ D-day 계산
                            let dDayLabel = "";
                            if (isBefore(end, today)) dDayLabel = "여행 종료";
                            else if (
                                isWithinInterval(today, { start, end }) ||
                                isSameDay(today, start)
                            )
                                dDayLabel = "D-DAY";
                            else dDayLabel = `D-${differenceInDays(start, today)}`;

                            const isCompleted = dDayLabel === "여행 종료";

                            // ✅ 메뉴 구성 (완료된 여행은 수정 버튼 제외)
                            const menuItems = [
                                !isCompleted && {
                                    key: "edit",
                                    icon: <EditOutlined />,
                                    label: "수정",
                                    onClick: ({ domEvent }) => {
                                        domEvent.stopPropagation(); // ✅ 상세 페이지 이동 방지
                                        onEdit(plan);
                                    },
                                },
                                {
                                    key: "delete",
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    label: "삭제",
                                    onClick: ({ domEvent }) => {
                                        domEvent.stopPropagation(); // ✅ 상세 페이지 이동 방지
                                        onDelete(plan.planId);
                                    },
                                },
                            ].filter(Boolean);

                            return (
                                <div
                                    key={plan.planId}
                                    onClick={() => onDetail(plan)}
                                    className="flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:shadow-md transition bg-white"
                                >
                                    {/* ✅ 썸네일 */}
                                    <img
                                        src={
                                            plan.thumbnailPath && plan.thumbnailPath.startsWith("http")
                                                ? plan.thumbnailPath
                                                : `https://api.cdn.visitjeju.net/photomng/imgpath/${plan.thumbnailPath}`
                                        }
                                        alt="썸네일"
                                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDetail(plan);
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/400x300?text=No+Image";
                                        }}
                                    />

                                    {/* ✅ 텍스트 정보 */}
                                    <div
                                        className="flex-1 ml-6 cursor-pointer"
                                        onClick={() => onDetail(plan)}
                                    >
                                        <h3 className="text-lg font-semibold text-[#0A3D91] mb-1 flex items-center">
                                            {plan.title || "제목 없음"}
                                            <span
                                                className={`ml-3 px-2 py-[2px] rounded-md text-xs font-semibold ${dDayLabel === "D-DAY"
                                                    ? "bg-[#FFB703] text-white"
                                                    : dDayLabel === "여행 종료"
                                                        ? "bg-gray-300 text-gray-700"
                                                        : "bg-[#3A6EA5] text-white"
                                                    }`}
                                            >
                                                {dDayLabel}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                                            {plan.travels?.length > 0
                                                ? plan.travels
                                                    .slice(0, 3)
                                                    .map((t) => t.travelName || t)
                                                    .join(", ") +
                                                (plan.travels.length > 3
                                                    ? ` 외 ${plan.travels.length - 3}곳`
                                                    : "")
                                                : "등록된 여행지가 없습니다."}
                                        </p>
                                    </div>

                                    {/* ✅ 우측 메뉴 버튼 */}
                                    <Dropdown
                                        menu={{ items: menuItems }}
                                        trigger={["click"]}
                                        placement="bottomRight"
                                    >
                                        <Button
                                            type="text"
                                            shape="circle"
                                            icon={<MoreOutlined />}
                                            className="hover:bg-gray-100"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Dropdown>
                                </div>
                            );
                        })}
                    </div>

                    {/* ✅ 페이지네이션 */}
                    {showPagination && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={plans.length}
                                onChange={onPageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
