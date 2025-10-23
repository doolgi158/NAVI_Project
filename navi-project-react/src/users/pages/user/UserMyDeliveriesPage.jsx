import { useEffect, useState } from "react";
import { Card, Tag, Button, Modal, Descriptions, message, Spin } from "antd";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";

const UserMyDeliveriesPage = () => {
    const [loading, setLoading] = useState(true);
    const [deliveryList, setDeliveryList] = useState([]);
    const [selectedBags, setSelectedBags] = useState(null);

    const token = localStorage.getItem("accessToken");

    // 짐 배송 예약 목록 불러오기
    const fetchDeliveries = async () => {
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/delivery/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.status === 200) {
                setDeliveryList(res.data.data || []);
            } else {
                message.error("짐 배송 예약 정보를 불러오지 못했습니다.");
            }
        } catch (err) {
            console.error("❌ [UserMyDeliveriesPage] fetchDeliveries 오류:", err);
            message.error("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    // 가방 정보 모달 열기
    const handleBagsView = (bags) => {
        if (!bags || Object.keys(bags).length === 0) {
            message.info("가방 정보가 없습니다.");
            return;
        }
        setSelectedBags(bags);
    };

    // 상태 색상 정의
    const getStatusTag = (status) => {
        const map = {
            PENDING: { color: "orange", label: "결제 대기" },
            PAID: { color: "blue", label: "환불 요청" },
            REFUNDED: { color: "green", label: "환불 완료" },
        };
        const info = map[status] || { color: "default", label: status };
        return <Tag color={info.color}>{info.label}</Tag>;
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto mt-12 px-4 pb-24">
                <h2 className="text-2xl font-bold mb-6">짐 배송 예약 현황 📦</h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : deliveryList.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        예약된 짐 배송이 없습니다.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {deliveryList.map((d) => (
                            <Card
                                key={d.drsvId}
                                className="border border-gray-200 shadow-md rounded-2xl hover:shadow-lg transition-all"
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-blue-600">
                                            배송번호: {d.drsvId}
                                        </span>
                                        {getStatusTag(d.status)}
                                    </div>
                                }
                            >
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">출발지</p>
                                    <p className="font-semibold">{d.startAddr || "-"}</p>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">도착지</p>
                                    <p className="font-semibold">{d.endAddr || "-"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">배송일</p>
                                        <p className="font-semibold">
                                            {dayjs(d.deliveryDate).format("YYYY-MM-DD")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">총 금액</p>
                                        <p className="font-semibold">
                                            ₩ {d.totalPrice?.toLocaleString() || "0"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                    <Button size="small" onClick={() => handleBagsView(d.bags)}>
                                        가방 정보
                                    </Button>

                                    <span className="text-xs text-gray-500">
                                        그룹 ID: {d.groupId || "-"}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* 가방 정보 모달 */}
            <Modal
                open={!!selectedBags}
                title="가방 상세 정보"
                footer={null}
                onCancel={() => setSelectedBags(null)}
            >
                {selectedBags ? (
                    <Descriptions bordered size="small" column={1}>
                        {Object.entries(selectedBags).map(([size, count]) => (
                            <Descriptions.Item key={size} label={`가방 (${size})`}>
                                {count}개
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                ) : (
                    <p>가방 정보가 없습니다.</p>
                )}
            </Modal>
        </MainLayout>
    );
};

export default UserMyDeliveriesPage;