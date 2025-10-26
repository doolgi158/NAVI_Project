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

            console.log(res);
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

    // 환불 요청
    const handleRefundRequest = async (merchantId) => {
        Modal.confirm({
            title: "환불 요청",
            content: "정말 이 결제를 환불하시겠습니까?",
            okText: "예, 환불합니다",
            cancelText: "취소",
            centered: true,
            async onOk() {
                try {
                    const res = await axios.post(
                        `${API_SERVER_HOST}/api/payment/refund/${merchantId}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (res.data.status === 200) {
                        message.success("환불 요청이 완료되었습니다.");
                        fetchPayments(); // 새로고침
                    } else {
                        message.error("환불 요청 처리에 실패했습니다.");
                    }
                } catch (err) {
                    console.error("❌ [handleRefundRequest] 오류:", err);
                    message.error("서버 통신 중 오류가 발생했습니다.");
                }
            },
        });
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
                                key={p.merchantId}
                                className="border border-gray-200 shadow-md rounded-2xl hover:shadow-lg transition-all"
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-blue-600">
                                            {p.rsvType === "ACC" ? "🏨 숙소" : "✈️ 항공"} 결제
                                        </span>
                                        <Tag color="purple">{p.merchantId}</Tag>
                                    </div>
                                }
                            >
                                <div className="mb-2">
                                    <p className="text-gray-500 text-sm">결제 수단</p>
                                    <p className="font-semibold">{p.paymentMethod}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-gray-500 text-sm">결제 금액</p>
                                        <p className="font-semibold">₩ {p.totalAmount?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">결제일</p>
                                        <p className="font-semibold">
                                            {p.createdAt ? dayjs(p.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <Tag
                                        color={
                                            p.paymentStatus === "PAID"
                                                ? "blue"
                                                : p.paymentStatus === "REFUNDED"
                                                    ? "green"
                                                    : p.paymentStatus === "CANCELLED"
                                                        ? "red"
                                                        : "gray"
                                        }
                                    >
                                        {p.paymentStatus === "PAID"
                                            ? "결제 완료"
                                            : p.paymentStatus === "REFUNDED"
                                                ? "환불 완료"
                                                : p.paymentStatus === "CANCELLED"
                                                    ? "취소됨"
                                                    : p.paymentStatus}
                                    </Tag>

                                    {p.paymentStatus === "PAID" ? (
                                        <Button
                                            type="primary"
                                            danger
                                            size="small"
                                            onClick={() => handleRefundRequest(p.merchantId)}
                                        >
                                            환불 요청
                                        </Button>
                                    ) : p.paymentStatus === "REFUNDED" ? (
                                        <Tag color="green">환불 완료</Tag>
                                    ) : (
                                        <Tag color="gray">변경 불가</Tag>
                                    )}

                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default UserMyPaymentsPage;