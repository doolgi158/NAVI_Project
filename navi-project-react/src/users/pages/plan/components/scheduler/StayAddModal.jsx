import React, { useEffect, useState } from "react";
import { Modal, Select, Card, Row, Col, Button, message } from "antd";
import { getAllStays, API_SERVER_HOST } from "@/common/api/planApi";

export default function StayAddModal({ open, onClose, onAdd, days = [] }) {
    const [stays, setStays] = useState([]);
    const [selected, setSelected] = useState([]);
    const [targetDayIdx, setTargetDayIdx] = useState(0);

    useEffect(() => {
        if (open) {
            getAllStays()
                .then((data) => setStays(data || []))
                .catch(() => message.error("숙소 데이터를 불러올 수 없습니다."));
            setSelected([]);
        }
    }, [open]);

    const toggleSelect = (item) => {
        setSelected((prev) =>
            prev.some((s) => s.accId === item.accId)
                ? prev.filter((s) => s.accId !== item.accId)
                : [...prev, item]
        );
    };

    return (
        <Modal
            open={open}
            title="숙소 추가"
            onCancel={onClose}
            footer={null}
            width={960}
            centered
            destroyOnClose
        >
            {/* DAY 선택 */}
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-600">추가할 일차 선택</span>
                <Select
                    value={targetDayIdx}
                    onChange={setTargetDayIdx}
                    options={days.map((d, i) => ({
                        label: `DAY ${i + 1} (${d.dateISO})`,
                        value: i,
                    }))}
                    style={{ width: 200 }}
                />
            </div>

            {/* 숙소 리스트 */}
            <Row gutter={[10, 10]} className="max-h-[520px] overflow-y-auto p-1 custom-scroll">
                {stays.map((item) => {
                    const isSelected = selected.some((s) => s.accId === item.accId);
                    const imgSrc =
                        item.accImage?.trim() ||
                        item.imagePath?.trim() ||
                        `${API_SERVER_HOST}/images/acc/default_hotel.jpg`;

                    return (
                        <Col key={item.accId} xs={12} sm={8} md={4} lg={4} xl={4}>
                            <div
                                className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all ${isSelected
                                        ? "border-[#0A3D91] scale-[1.03]"
                                        : "border-gray-200 hover:border-[#0A3D91]/40"
                                    }`}
                                onClick={() => toggleSelect(item)}
                            >
                                {/* ✅ 이미지 */}
                                <div className="w-full h-32 overflow-hidden">
                                    <img
                                        src={imgSrc}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) =>
                                            (e.target.src = "https://placehold.co/400x300?text=No+Image")
                                        }
                                    />
                                </div>

                                {/* ✅ 텍스트 정보 */}
                                <div className="p-2">
                                    <p className="font-semibold text-xs text-[#2F3E46] truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                        {item.address}
                                    </p>
                                </div>

                                {/* ✅ 선택 오버레이 */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-gray-700/40 backdrop-blur-[1px] flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm bg-[#0A3D91]/80 px-3 py-1 rounded-full shadow">
                                            ✓ 선택됨
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Col>
                    );
                })}
            </Row>

            {/* 하단 버튼 */}
            <div className="flex justify-end mt-5 gap-2">
                <Button onClick={onClose}>취소</Button>
                <Button
                    type="primary"
                    className="bg-[#0A3D91]"
                    disabled={!selected.length}
                    onClick={() => {
                        onAdd(selected, targetDayIdx);
                        message.success(`${selected.length}개의 숙소가 추가되었습니다.`);
                        onClose();
                    }}
                >
                    추가하기
                </Button>
            </div>
        </Modal>
    );
}
