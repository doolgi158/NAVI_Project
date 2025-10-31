import React, { useEffect, useState, useMemo } from "react";
import { Modal, Select, Card, Row, Col, Button, message, Input, Pagination } from "antd";
import { getAllTravels } from "@/common/api/planApi";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import "bootstrap-icons/font/bootstrap-icons.css";
import TravelFilterModal from "@/users/pages/plan/components/TravelFilterModal";

export default function TravelAddModal({ open, onClose, onAdd, days = [] }) {
    const [travels, setTravels] = useState([]);
    const [selectedMap, setSelectedMap] = useState({});
    const [searchText, setSearchText] = useState("");
    const [activeCategory, setActiveCategory] = useState("전체");
    const [regionFilterQuery, setRegionFilterQuery] = useState({ region2Name: [] });
    const [filterOpen, setFilterOpen] = useState(false); // ✅ 고급 필터 모달
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;


    /** ✅ 데이터 로드 */
    useEffect(() => {
        if (open) {
            getAllTravels()
                .then((data) => setTravels(data || []))
                .catch(() => message.error("여행지 데이터를 불러올 수 없습니다."));
            setSelectedMap({});
            setSearchText("");
            setActiveCategory("전체");
            setRegionFilterQuery({ region2Name: [] });
            setCurrentPage(1);
        }
    }, [open]);

    /** ✅ 문자열 정규화 */
    const normalize = (str = "") => str.replace(/\s+/g, "").toLowerCase().trim();

    /** ✅ 필터링 처리 */
    const filteredTravels = useMemo(() => {
        let result = travels;

        // ✅ 카테고리 필터
        if (activeCategory !== "전체") {
            result = result.filter((t) => {
                const category = normalize(t.categoryName || "");
                const active = normalize(activeCategory);
                return category === active;
            });
        }

        // ✅ 지역 필터 (모달 적용)
        if (regionFilterQuery.region2Name?.length > 0) {
            result = result.filter((t) =>
                regionFilterQuery.region2Name.some((r2) =>
                    (t.region2Name || "").includes(r2)
                )
            );
        }

        // ✅ 검색어 필터
        if (searchText.trim()) {
            const keyword = normalize(searchText);
            result = result.filter(
                (t) =>
                    normalize(t.title || "").includes(keyword) ||
                    normalize(t.address || "").includes(keyword) ||
                    normalize(t.region1Name || "").includes(keyword) ||
                    normalize(t.region2Name || "").includes(keyword)
            );
        }

        return result;
    }, [travels, activeCategory, regionFilterQuery, searchText]);

    /** ✅ 현재 페이지 아이템 */
    const paginatedTravels = useMemo(() => {
        const startIdx = (currentPage - 1) * pageSize;
        return filteredTravels.slice(startIdx, startIdx + pageSize);
    }, [filteredTravels, currentPage]);

    /** ✅ 선택 핸들러 */
    const toggleSelect = (item) => {
        const key = String(item.travelId ?? item.id ?? item.contentid ?? item.contentId);
        setSelectedMap((prev) => {
            const copy = { ...prev };
            if (copy[key]) delete copy[key];
            else copy[key] = 0;
            return copy;
        });
    };

    const handleDayChange = (travelId, newIdx) => {
        setSelectedMap((prev) => ({ ...prev, [travelId]: Number(newIdx) }));
    };

    /** ✅ 추가 버튼 */
    const handleConfirm = () => {
        const grouped = {};
        Object.entries(selectedMap).forEach(([travelId, dayIdx]) => {
            const item = travels.find(
                (t) =>
                    String(t.travelId ?? t.id ?? t.contentid ?? t.contentId) === String(travelId)
            );
            if (!item) return;
            if (!grouped[dayIdx]) grouped[dayIdx] = [];
            grouped[dayIdx].push(item);
        });
        onAdd(grouped);
        message.success(`${Object.keys(selectedMap).length}개의 여행지가 추가되었습니다.`);
        onClose();
    };

    /** ✅ 카테고리 버튼 */
    const CategoryButton = ({ name }) => {
        const normalizedActive = normalize(activeCategory);
        const normalizedName = normalize(name);
        const isActive = normalizedActive === normalizedName;

        return (
            <button
                key={name}
                onClick={() => {
                    setActiveCategory(name);
                    setCurrentPage(1);
                }}
                className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap ${isActive
                    ? "border-blue-500 bg-blue-500 text-white font-medium shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
            >
                {name}
            </button>
        );
    };

    return (
        <>
            <Modal
                open={open}
                title="여행지 추가"
                onCancel={onClose}
                footer={null}
                width={950}
                centered
                destroyOnClose
            >
                {/* 🔍 검색 + 카테고리 + 고급필터 */}
                <div className="mb-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <Input.Search
                            placeholder="여행지 또는 주소를 입력하세요 (공백 무시)"
                            allowClear
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{ width: 300 }}
                        />
                        <div className="flex items-center gap-3">
                            <Button
                                size="small"
                                className="border-[#0A3D91] text-[#0A3D91]"
                                onClick={() => setFilterOpen(true)}
                            >
                                고급 필터
                            </Button>
                            <span className="text-sm text-gray-500">
                                총 {filteredTravels.length.toLocaleString()}개
                            </span>
                        </div>
                    </div>



                    {/* ✅ 선택된 필터 표시 */}
                    <div className="text-xs text-gray-500 mt-1">
                        {activeCategory === "전체" && (!regionFilterQuery.region2Name?.length)
                            ? "현재 필터: 전체 보기"
                            : (
                                <>
                                    현재 필터:{" "}
                                    {activeCategory !== "전체" && (
                                        <span className="font-medium text-[#0A3D91]">
                                            {activeCategory}
                                        </span>
                                    )}
                                    {regionFilterQuery.region2Name?.length > 0 && (
                                        <>
                                            {" / "}
                                            <span className="font-medium text-[#0A3D91]">
                                                {regionFilterQuery.region2Name.join(", ")}
                                            </span>
                                        </>
                                    )}
                                </>
                            )}
                    </div>
                </div>

                {/* 🔸 여행지 리스트 */}
                <Row gutter={[12, 12]} className="max-h-[520px] overflow-y-auto p-1 custom-scroll">
                    {paginatedTravels.map((item) => {
                        const idKey = String(item.travelId ?? item.id ?? item.contentid ?? item.contentId);
                        const isSelected = selectedMap[idKey] !== undefined;
                        const selectedDay = selectedMap[idKey];
                        const imgSrc =
                            item.img?.trim() ||
                            item.thumbnailPath?.trim() ||
                            item.imagePath?.trim() ||
                            `${API_SERVER_HOST}/images/travel/default.jpg`;

                        return (
                            <Col key={idKey} xs={12} sm={8} md={4} lg={4}>
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
                                                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center text-white font-semibold text-sm">
                                                    선택됨
                                                </div>
                                            )}
                                        </div>
                                    }
                                >
                                    <Card.Meta
                                        title={<p className="font-semibold text-[#2F3E46] truncate">{item.title}</p>}
                                        description={
                                            <>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {item.region1Name || ""}{" > "}{item.region2Name || ""}
                                                </p>
                                                {isSelected && (
                                                    <Select
                                                        value={selectedDay}
                                                        onChange={(val) => handleDayChange(idKey, val)}
                                                        options={days.map((d, i) => ({
                                                            label: `DAY ${i + 1}`,
                                                            value: i,
                                                        }))}
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

                {/* 🔸 페이지네이션 */}
                {filteredTravels.length > pageSize && (
                    <div className="flex justify-center mt-5">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredTravels.length}
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
                        onClick={handleConfirm}
                    >
                        추가하기
                    </Button>
                </div>
            </Modal>

            {/* ✅ 고급 필터 모달 */}
            <TravelFilterModal
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={({ category, regionQuery }) => {
                    if (category) setActiveCategory(category);
                    if (regionQuery) setRegionFilterQuery(regionQuery);
                    setFilterOpen(false);
                }}
            />
        </>
    );
}
