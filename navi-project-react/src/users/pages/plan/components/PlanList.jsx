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
 * ✅ 재사용 가능한 여행계획 목록 컴포넌트
 * props:
 * - plans: 여행 데이터 배열
 * - loading: 로딩 상태
 * - showPagination: 페이지네이션 여부
 * - currentPage / pageSize / onPageChange: 페이지네이션 제어용
 * - onDetail(plan): 상세보기
 * - onEdit(plan): 수정
 * - onDelete(id): 삭제
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
    const paginatedList = showPagination
        ? plans.slice(startIdx, endIdx)
        : plans;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return format(new Date(dateStr), "yy.MM.dd");
        } catch {
            return dateStr;
        }
    };

    return (
        <Card className="w-[900px] rounded-2xl shadow-sm">
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
                            else if (isWithinInterval(today, { start, end }) || isSameDay(today, start))
                                dDayLabel = "D-DAY";
                            else dDayLabel = `D-${differenceInDays(start, today)}`;

                            const menuItems = [
                                { key: "edit", icon: <EditOutlined />, label: "수정", onClick: () => onEdit(plan) },
                                { key: "delete", icon: <DeleteOutlined />, danger: true, label: "삭제", onClick: () => onDelete(plan.id) },
                            ];

                            return (
                                <div
                                    key={plan.id}
                                    className="flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:shadow-md transition bg-white"
                                >
                                    <img
                                        src={plan.thumbnailPath || "https://placehold.co/100x100"}
                                        alt="썸네일"
                                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                                        onClick={() => onDetail(plan)}
                                    />

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
                                                ? plan.travels.slice(0, 3).join(", ") +
                                                (plan.travels.length > 3
                                                    ? ` 외 ${plan.travels.length - 3}곳`
                                                    : "")
                                                : "등록된 여행지가 없습니다."}
                                        </p>
                                    </div>

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
                                        />
                                    </Dropdown>
                                </div>
                            );
                        })}
                    </div>

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
