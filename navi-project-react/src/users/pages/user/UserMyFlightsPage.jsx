import { useEffect, useState } from "react";
import { Card, Tag, Button, Modal, Descriptions, message, Spin } from "antd";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";

const UserMyFlightsCardList = () => {
    const [loading, setLoading] = useState(true);
    const [flightList, setFlightList] = useState([]);
    const [selectedPassengers, setSelectedPassengers] = useState(null);

    const token = localStorage.getItem("accessToken");
    const userNo = localStorage.getItem("userNo");

    const fetchFlights = async () => {
        if (!token || !userNo) {
            message.warning("로그인이 필요합니다.");
            return;
        }
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/flight/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.status === 200) {
                setFlightList(res.data.data || []);
            } else {
                message.error("항공편 예약 정보를 불러오지 못했습니다.");
            }
        } catch (err) {
            console.error("❌ [UserMyFlightsCardList] fetchFlights 오류:", err);
            message.error("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const handlePassengersView = (passengersJson) => {
        if (!passengersJson) {
            message.info("등록된 탑승자 정보가 없습니다.");
            return;
        }
        try {
            const passengers = JSON.parse(passengersJson);
            if (Array.isArray(passengers) && passengers.length > 0) {
                setSelectedPassengers(passengers);
            } else {
                message.info("탑승자 정보가 비어 있습니다.");
            }
        } catch (err) {
            message.error("탑승자 정보를 불러올 수 없습니다.");
        }
    };

    const handleRefund = (frsvId) => {
        message.info(`환불 요청: ${frsvId}`);
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto mt-12 px-4 pb-24">
                <h2 className="text-2xl font-bold mb-6">항공편 예약 현황 ✈️</h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : flightList.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        예약된 항공편이 없습니다.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {flightList.map((f) => (
                            <Card
                                key={f.frsvId}
                                className="border border-gray-200 shadow-md rounded-2xl hover:shadow-lg transition-all"
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-blue-600">
                                            {f.flightId} ({f.airline})
                                        </span>
                                        <Tag color="geekblue">{f.frsvId}</Tag>
                                    </div>
                                }
                            >
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">출발</p>
                                        <p className="text-base font-semibold">
                                            {f.depAirport}{" "}
                                            <span className="text-gray-400">
                                                {f.depTime && dayjs(f.depTime).format("MM-DD HH:mm")}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">도착</p>
                                        <p className="text-base font-semibold">
                                            {f.arrAirport}{" "}
                                            <span className="text-gray-400">
                                                {f.arrTime && dayjs(f.arrTime).format("MM-DD HH:mm")}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">좌석</p>
                                        <p className="font-semibold">{f.seatNo || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">결제금액</p>
                                        <p className="font-semibold">
                                            ₩ {f.totalPrice?.toLocaleString() || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div>
                                        <Tag
                                            color={
                                                f.status === "PAID"
                                                    ? "blue"
                                                    : f.status === "REFUNDED"
                                                        ? "green"
                                                        : f.status === "CANCELLED"
                                                            ? "red"
                                                            : "gray"
                                            }
                                        >
                                            {f.status === "PAID"
                                                ? "결제 완료"
                                                : f.status === "REFUNDED"
                                                    ? "환불 완료"
                                                    : f.status === "CANCELLED"
                                                        ? "취소됨"
                                                        : f.status}
                                        </Tag>
                                        <span className="ml-2 text-sm text-gray-500">
                                            결제일:{" "}
                                            {f.paidAt
                                                ? dayjs(f.paidAt).format("YYYY-MM-DD")
                                                : "-"}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="small"
                                            onClick={() => handlePassengersView(f.passengersJson)}
                                        >
                                            탑승자
                                        </Button>
                                        {f.status === "PAID" ? (
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                onClick={() => handleRefund(f.frsvId)}
                                            >
                                                환불 요청
                                            </Button>
                                        ) : f.status === "REFUNDED" ? (
                                            <Tag color="green">환불 완료</Tag>
                                        ) : (
                                            <Tag color="gray">변경 불가</Tag>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={!!selectedPassengers}
                title="탑승자 정보"
                footer={null}
                onCancel={() => setSelectedPassengers(null)}
            >
                {selectedPassengers ? (
                    <Descriptions bordered size="small" column={1}>
                        {selectedPassengers.map((p, i) => (
                            <Descriptions.Item key={i} label={`탑승자 ${i + 1}`}>
                                {p.name} / {p.gender} / {p.birth}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                ) : (
                    <p>탑승자 정보가 없습니다.</p>
                )}
            </Modal>
        </MainLayout>
    );
};

export default UserMyFlightsCardList;