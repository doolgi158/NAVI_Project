import React, { useEffect, useState } from "react";
import { Modal, Select, Card, Row, Col, Button, message } from "antd";
import { getAllTravels } from "@/common/api/planApi";
import { API_SERVER_HOST } from "@/common/api/naviApi";

export default function TravelAddModal({ open, onClose, onAdd, days = [] }) {
    const [travels, setTravels] = useState([]);
    const [selectedMap, setSelectedMap] = useState({}); // ✅ travelId: dayIdx 형태

    useEffect(() => {
        if (open) {
            getAllTravels()
                .then((data) => setTravels(data || []))
                .catch(() => message.error("여행지 데이터를 불러올 수 없습니다."));
            setSelectedMap({});
        }
    }, [open]);

    const toggleSelect = (item) => {
        const key = String(item.travelId ?? item.id ?? item.contentid ?? item.contentId);
        setSelectedMap((prev) => {
            const copy = { ...prev };
            if (copy[key]) delete copy[key];
            else copy[key] = 0;
            console.log("🟡 toggleSelect() after change:", copy);
            return copy;
        });
    };

    useEffect(() => {
        console.log("🟢 selectedMap updated:", selectedMap);
    }, [selectedMap]);

    const handleDayChange = (travelId, newIdx) => {
        setSelectedMap((prev) => ({ ...prev, [travelId]: Number(newIdx) }));
    };

    const handleConfirm = () => {
        const grouped = {};
        Object.entries(selectedMap).forEach(([travelId, dayIdx]) => {
            const item = travels.find(
                (t) =>
                    String(t.travelId ?? t.id ?? t.contentid ?? t.contentId) ===
                    String(travelId)
            );
            if (!item) {
                console.warn("❌ item not found for travelId:", travelId);
                return;
            }
            if (!grouped[dayIdx]) grouped[dayIdx] = [];
            grouped[dayIdx].push(item);
        });
        console.log("✅ grouped before onAdd:", grouped);
        onAdd(grouped); // ✅ dayIdx별 묶어서 전달
        message.success(`${Object.keys(selectedMap).length}개의 여행지가 추가되었습니다.`);
        onClose();
    };

    return (
        <Modal
            open={open}
            title="여행지 추가"
            onCancel={onClose}
            footer={null}
            width={950}
            centered
            destroyOnClose
        >
            <Row gutter={[12, 12]} className="max-h-[520px] overflow-y-auto p-1 custom-scroll">
                {travels.map((item) => {
                    const isSelected = selectedMap[item.travelId] !== undefined;
                    const selectedDay = selectedMap[item.travelId];
                    const imgSrc =
                        item.img?.trim() ||
                        item.thumbnailPath?.trim() ||
                        item.imagePath?.trim() ||
                        `${API_SERVER_HOST}/images/travel/default.jpg`;

                    return (
                        <Col key={item.travelId} xs={12} sm={8} md={4} lg={4}>
                            <Card
                                hoverable
                                className={`relative transition-all rounded-xl overflow-hidden cursor-pointer ${isSelected ? "ring-4 ring-[#0A3D91] ring-offset-2" : "hover:shadow-md"
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
                                            <p className="text-xs text-gray-500 line-clamp-2">{item.address}</p>
                                            {isSelected && (
                                                <Select
                                                    value={selectedDay}
                                                    onChange={(val) => handleDayChange(item.travelId, val)}
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
    );
}
