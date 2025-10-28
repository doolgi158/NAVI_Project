import React, { useEffect, useState, useMemo } from "react";
import { Modal, Select, Card, Row, Col, Button, message, Input, Pagination } from "antd";
import { getAllStays, API_SERVER_HOST } from "@/common/api/planApi";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function StayAddModal({ open, onClose, onAdd, days = [], selectedStays = [] }) {
    const [stays, setStays] = useState([]);
    const [selectedMap, setSelectedMap] = useState({});
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        if (!open) return;

        // ✅ 1. 숙소 데이터 불러오기
        getAllStays()
            .then((data) => {
                setStays(data || []);

                // ✅ 2. 현재 days 기반 preselected 계산
                const preselected = {};
                days.forEach((day, idx) => {
                    (day.items || []).forEach((it) => {
                        if (it.type === "stay" && it.stayId) {
                            preselected[String(it.stayId)] = idx;
                        }
                    });
                });

                // ✅ 3. 선택맵 초기화 (저장 안 된 선택은 모두 제거)
                setSelectedMap(preselected);
            })
            .catch(() => message.error("숙소 데이터를 불러올 수 없습니다."));
    }, [open, days]);
    const handleClose = () => {
        // ✅ 모달 닫을 때 선택 초기화 (플래너 반영 X)
        setSelectedMap({});
        onClose();
    };


    // ✅ 기존 플래너 데이터 반영
    useEffect(() => {
        if (!open) return;
        const preselected = {};
        days.forEach((day, idx) => {
            (day.items || []).forEach((it) => {
                if (it.type === "stay" && it.stayId) {
                    const key = String(it.stayId);
                    if (!preselected[key]) preselected[key] = [];
                    preselected[key].push(idx);
                }
            });
        });
        setSelectedMap(preselected);
    }, [days, open]);

    const normalize = (str = "") => str.replace(/\s+/g, "").toLowerCase().trim();

    const filteredStays = useMemo(() => {
        let result = stays;
        if (searchText.trim()) {
            const keyword = normalize(searchText);
            result = result.filter(
                (s) =>
                    normalize(s.title || "").includes(keyword) ||
                    normalize(s.address || "").includes(keyword)
            );
        }
        return result;
    }, [stays, searchText]);

    const paginatedStays = useMemo(() => {
        const startIdx = (currentPage - 1) * pageSize;
        return filteredStays.slice(startIdx, startIdx + pageSize);
    }, [filteredStays, currentPage]);

    /** ✅ 숙소 클릭 (토글) */
    const toggleSelect = (item) => {
        const key = String(item.accId);

        // ✅ 이미 플래너에 등록된 숙소면 클릭 불가
        const isPreselected = days.some((day) =>
            (day.items || []).some(
                (it) => it.type === "stay" && String(it.stayId) === key
            )
        );
        if (isPreselected) return;

        setSelectedMap((prev) => {
            const copy = { ...prev };

            // ✅ 이미 선택된 숙소 → 해제 허용
            if (copy[key] !== undefined) {
                delete copy[key];
                return copy;
            }

            // ✅ 현재 일정에서 숙소가 배정된 day 인덱스 수집
            const occupiedDayIdx = new Set();
            days.forEach((d, idx) => {
                if ((d.items || []).some((it) => it.type === "stay")) {
                    occupiedDayIdx.add(idx);
                }
            });
            Object.values(copy).flat().forEach((idx) => occupiedDayIdx.add(idx));

            const maxStayCount = Math.max(days.length - 1, 1);

            // ✅ 현재까지 선택된 숙소가 점유한 DAY 수
            const totalSelectedDays = Object.values(copy)
                .flat()
                .reduce((acc, cur) => acc.add(cur), new Set()).size;

            if (totalSelectedDays >= maxStayCount) {
                Modal.warning({
                    title: "숙소 선택 제한",
                    content: `이 여행은 ${maxStayCount}박 일정입니다. 숙소는 최대 ${maxStayCount}박까지만 선택할 수 있습니다.`,
                    centered: true,
                });
                return prev;
            }

            // ✅ 아직 숙소 없는 첫 번째 day 탐색
            const availableDayIdx = days.findIndex(
                (_, i) => !occupiedDayIdx.has(i)
            );
            if (availableDayIdx === -1) {
                Modal.warning({
                    title: "숙소 선택 제한",
                    content: "모든 일정에 숙소가 배정되어 있습니다.",
                    centered: true,
                });
                return prev;
            }

            copy[key] = [availableDayIdx]; // ✅ 여러 DAY를 가질 수 있도록 배열로 관리
            return copy;
        });
    };

    /** ✅ DAY 변경 / 추가 */
    const handleDayChange = (accId, newIdxArr) => {
        const maxStayCount = Math.max(days.length - 1, 1);

        // ✅ 선택된 DAY 전체 중복 방지
        const allSelectedDays = Object.entries(selectedMap)
            .filter(([id]) => id !== accId)
            .flatMap(([, dayArr]) => dayArr);

        const overlap = newIdxArr.some((d) => allSelectedDays.includes(d));
        if (overlap) {
            Modal.warning({
                title: "숙소 중복 선택",
                content: `이미 다른 숙소가 선택된 DAY가 포함되어 있습니다.`,
                centered: true,
            });
            return;
        }

        // ✅ 전체 DAY 점유 수 제한
        const totalSelectedDays = new Set([
            ...allSelectedDays,
            ...newIdxArr,
        ]).size;
        if (totalSelectedDays > maxStayCount) {
            Modal.warning({
                title: "숙소 선택 제한",
                content: `이 여행은 ${maxStayCount}박 일정입니다. 숙소는 총 ${maxStayCount}박까지만 선택할 수 있습니다.`,
                centered: true,
            });
            return;
        }

        setSelectedMap((prev) => ({ ...prev, [accId]: newIdxArr }));
    };

    /** ✅ 추가 버튼 */
    const handleAdd = () => {
        const grouped = {};
        Object.entries(selectedMap).forEach(([accId, dayIdxList]) => {
            const stay = stays.find((s) => String(s.accId) === accId);
            if (!stay) return;

            // ✅ PlanItem 형식으로 통일
            const stayItem = {
                type: "stay",
                title: stay.title,
                stayId: stay.accId || stay.stayId,
                img: stay.mainImage
                    ? `${API_SERVER_HOST}${stay.mainImage.startsWith("/") ? stay.mainImage : `/images/acc/${stay.mainImage}`}`
                    : `https://placehold.co/150x150?text=No+Image`,
                lat: stay.lat,
                lng: stay.lng,
            };

            dayIdxList.forEach((dayIdx) => {
                if (!grouped[dayIdx]) grouped[dayIdx] = [];
                grouped[dayIdx].push(stayItem);
            });
        });

        onAdd(grouped);
        message.success(`${Object.keys(selectedMap).length}개의 숙소가 추가되었습니다.`);
        onClose();
    };

    return (
        <Modal open={open} title="숙소 추가" onCancel={handleClose} footer={null} width={950} centered>
            {/* 검색창 */}
            <div className="mb-4 flex justify-between items-center">
                <Input.Search
                    placeholder="숙소명 또는 주소를 입력하세요"
                    allowClear
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ width: 300 }}
                />
                <span className="text-sm text-gray-500">
                    총 {filteredStays.length.toLocaleString()}개
                </span>
            </div>

            {/* 숙소 리스트 */}
            <Row gutter={[10, 10]} className="max-h-[520px] overflow-y-auto p-1 custom-scroll">
                {paginatedStays.map((item) => {
                    const key = String(item.accId);
                    const isSelected = selectedMap[key] !== undefined;
                    const selectedDays = selectedMap[key] || [];
                    const imgSrc =
                        item.accImage?.trim() ||
                        item.imagePath?.trim() ||
                        item.mainImage?.trim() || // ✨ 수정된 부분: mainImage 필드 추가
                        `https://placehold.co/150x150?text=No+Image`;

                    return (
                        <Col key={key} xs={12} sm={8} md={4} lg={4}>
                            <Card
                                hoverable
                                className={`relative transition-all rounded-xl overflow-hidden cursor-pointer ${isSelected
                                    ? "ring-4 ring-[#0A3D91] ring-offset-2"
                                    : "hover:shadow-md"
                                    }`}
                                cover={
                                    <div className="relative">
                                        <img
                                            src={imgSrc}
                                            alt={item.title}
                                            className="h-36 w-full object-cover"
                                            onClick={() => toggleSelect(item)}
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-[#0A3D91]/20 flex items-center justify-center text-white font-semibold text-sm">
                                                {Array.isArray(selectedDays) &&
                                                    selectedDays.map((d) => (
                                                        <span
                                                            key={d}
                                                            className="mx-1 bg-black/40 px-2 py-1 rounded"
                                                        >
                                                            DAY {d + 1}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                }
                            >
                                <Card.Meta
                                    title={
                                        <p className="font-semibold text-[#2F3E46] truncate">
                                            {item.title}
                                        </p>
                                    }
                                    description={
                                        <>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {item.address || ""}
                                            </p>
                                            {isSelected && (
                                                <Select
                                                    mode="multiple"
                                                    value={selectedDays}
                                                    onChange={(vals) =>
                                                        setSelectedMap((prev) => ({
                                                            ...prev,
                                                            [key]: vals.sort((a, b) => a - b),
                                                        }))
                                                    }
                                                    options={days
                                                        .slice(0, Math.max(days.length - 1, 1))
                                                        .map((d, i) => {
                                                            const hasStay = (d.items || []).some(
                                                                (it) => it.type === "stay"
                                                            );
                                                            return {
                                                                label: (
                                                                    <span
                                                                        style={{
                                                                            color: hasStay
                                                                                ? "#999"
                                                                                : "#000",
                                                                        }}
                                                                    >
                                                                        DAY {i + 1}{" "}
                                                                        {hasStay
                                                                            ? "(숙소 있음)"
                                                                            : ""}
                                                                    </span>
                                                                ),
                                                                value: i,
                                                                disabled: hasStay,
                                                            };
                                                        })}
                                                    size="small"
                                                    className="mt-2 w-full"
                                                />
                                            )}
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* 페이지네이션 */}
            {filteredStays.length > pageSize && (
                <div className="flex justify-center mt-5">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredStays.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                    />
                </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex justify-end mt-5 gap-2">
                <Button onClick={onClose}>취소</Button>
                <Button
                    type="primary"
                    className="bg-[#0A3D91]"
                    disabled={!Object.keys(selectedMap).length}
                    onClick={handleAdd}
                >
                    추가하기
                </Button>
            </div>
        </Modal>
    );
}