import { useEffect, useState } from "react";
import { Card, Tag, Button, Modal, Descriptions, message, Spin } from "antd";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";

const UserMyPaymentsPage = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const token = localStorage.getItem("accessToken");

    const fetchPayments = async () => {
        if (!token) {
            message.warning("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/payment/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.status === 200) {
                setPayments(res.data.data || []);
            } else {
                message.error("결제 내역을 불러오지 못했습니다.");
            }
        } catch (err) {
            console.error("❌ [UserMyPaymentsPage] fetchPayments 오류:", err);
            message.error("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto mt-12 px-4 pb-24">
                <h2 className="text-2xl font-bold mb-6">결제 내역 💳</h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : payments.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        결제 내역이 없습니다.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {payments.map((p) => (
                            <Card
                                key={p.paymentId}
                                className="border border-gray-200 shadow-md rounded-2xl hover:shadow-lg transition-all"
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-blue-600">
                                            {p.type === "ACCOMMODATION" ? "🏨 숙소" : "✈️ 항공"} 결제
                                        </span>
                                        <Tag color="purple">{p.paymentId}</Tag>
                                    </div>
                                }
                            >
                                <div className="mb-2">
                                    <p className="text-gray-500 text-sm">결제 항목</p>
                                    <p className="font-semibold">{p.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-gray-500 text-sm">결제 금액</p>
                                        <p className="font-semibold">₩ {p.amount?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">결제일</p>
                                        <p className="font-semibold">
                                            {p.paidAt ? dayjs(p.paidAt).format("YYYY-MM-DD HH:mm") : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <Tag
                                        color={
                                            p.status === "PAID"
                                                ? "blue"
                                                : p.status === "REFUNDED"
                                                    ? "green"
                                                    : p.status === "CANCELLED"
                                                        ? "red"
                                                        : "gray"
                                        }
                                    >
                                        {p.status === "PAID"
                                            ? "결제 완료"
                                            : p.status === "REFUNDED"
                                                ? "환불 완료"
                                                : p.status === "CANCELLED"
                                                    ? "취소됨"
                                                    : p.status}
                                    </Tag>

                                    <Button size="small" onClick={() => handleViewDetails(p)}>
                                        상세보기
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* 상세 모달 */}
            <Modal
                open={!!selectedPayment}
                title="결제 상세 정보"
                footer={null}
                onCancel={() => setSelectedPayment(null)}
            >
                {selectedPayment ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="결제 ID">{selectedPayment.paymentId}</Descriptions.Item>
                        <Descriptions.Item label="결제 유형">
                            {selectedPayment.type === "ACCOMMODATION" ? "숙소" : "항공"}
                        </Descriptions.Item>
                        <Descriptions.Item label="결제 항목">{selectedPayment.title}</Descriptions.Item>
                        <Descriptions.Item label="결제 금액">
                            ₩ {selectedPayment.amount?.toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="결제 상태">{selectedPayment.status}</Descriptions.Item>
                        <Descriptions.Item label="결제 수단">{selectedPayment.method || "-"}</Descriptions.Item>
                        <Descriptions.Item label="결제 일시">
                            {selectedPayment.paidAt ? dayjs(selectedPayment.paidAt).format("YYYY-MM-DD HH:mm") : "-"}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <p>결제 정보를 불러올 수 없습니다.</p>
                )}
            </Modal>
        </MainLayout>
    );
};

export default UserMyPaymentsPage;