import { useEffect, useState } from "react";
import { Card, Tag, Button, Modal, Descriptions, message, Spin } from "antd";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";

const UserMyAccommodationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [bookingList, setBookingList] = useState([]);
    const [selectedGuests, setSelectedGuests] = useState(null);

    const token = localStorage.getItem("accessToken");

    // 숙소 예약 내역 불러오기
    const fetchBookings = async () => {
        if (!token) {
            message.warning("로그인이 필요합니다.");
            return;
        }
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/room/reserve`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ 숙소 예약 내역:", res.data);
            if (res.data.status === 200) {
                setBookingList(res.data.data || []);
            } else {
                message.error("숙소 예약 정보를 불러오지 못했습니다.");
            }
        } catch (err) {
            console.error("❌ [UserMyAccommodationsPage] fetchBookings 오류:", err);
            message.error("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // 투숙객 정보 보기
    const handleGuestsView = (guestsJson) => {
        if (!guestsJson) {
            message.info("등록된 투숙객 정보가 없습니다.");
            return;
        }
        try {
            const guests = JSON.parse(guestsJson);
            if (Array.isArray(guests) && guests.length > 0) {
                setSelectedGuests(guests);
            } else {
                message.info("투숙객 정보가 비어 있습니다.");
            }
        } catch (err) {
            message.error("투숙객 정보를 불러올 수 없습니다.");
        }
    };

    // 예약 취소
    const handleCancel = async (rsvId) => {
        Modal.confirm({
            title: "예약 취소 확인",
            content: "정말 이 숙소 예약을 취소하시겠습니까?",
            okText: "예, 취소합니다",
            cancelText: "아니요",
            async onOk() {
                try {
                    const res = await axios.post(
                        `${API_SERVER_HOST}/api/accommodation/cancel/${rsvId}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (res.data.status === 200) {
                        message.success("예약이 취소되었습니다.");
                        fetchBookings();
                    } else {
                        message.error("예약 취소에 실패했습니다.");
                    }
                } catch (err) {
                    console.error("❌ 예약 취소 오류:", err);
                    message.error("서버 오류로 취소에 실패했습니다.");
                }
            },
        });
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto mt-12 px-4 pb-24">
                <h2 className="text-2xl font-bold mb-6">숙소 예약 현황 🏨</h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : bookingList.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        예약된 숙소가 없습니다.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookingList.map((b, i) => (
                            <Card
                                key={b.rsvId || i}
                                className="border border-gray-200 shadow-md rounded-2xl hover:shadow-lg transition-all"
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-blue-600">
                                            {b.accName || "숙소명 미등록"}
                                        </span>
                                        <Tag color="purple">{b.rsvId}</Tag>
                                    </div>
                                }
                            >
                                {/* 체크인 / 체크아웃 */}
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">체크인</p>
                                        <p className="font-semibold">
                                            {b.checkIn ? dayjs(b.checkIn).format("YYYY-MM-DD") : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">체크아웃</p>
                                        <p className="font-semibold">
                                            {b.checkOut ? dayjs(b.checkOut).format("YYYY-MM-DD") : "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* 객실 및 인원 */}
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">객실명</p>
                                        <p className="font-semibold">{b.roomName || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">인원</p>
                                        <p className="font-semibold">{b.guestCount || 1}명</p>
                                    </div>
                                </div>

                                {/* 결제 정보 */}
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">결제금액</p>
                                        <p className="font-semibold">
                                            ₩ {b.totalPrice?.toLocaleString() || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">상태</p>
                                        <Tag
                                            color={
                                                b.status === "PAID"
                                                    ? "blue"
                                                    : b.status === "REFUNDED"
                                                        ? "green"
                                                        : b.status === "CANCELLED"
                                                            ? "red"
                                                            : "gray"
                                            }
                                        >
                                            {b.status === "PAID"
                                                ? "결제 완료"
                                                : b.status === "REFUNDED"
                                                    ? "환불 완료"
                                                    : b.status === "CANCELLED"
                                                        ? "취소됨"
                                                        : b.status || "알 수 없음"}
                                        </Tag>
                                    </div>
                                </div>

                                {/* 버튼 영역 */}
                                <div className="flex justify-end items-center mt-2 gap-2">
                                    <Button
                                        size="small"
                                        onClick={() => handleGuestsView(b.guestsJson)}
                                    >
                                        투숙객
                                    </Button>
                                    {b.status === "PAID" ? (
                                        <Button
                                            type="primary"
                                            danger
                                            size="small"
                                            onClick={() => handleCancel(b.rsvId)}
                                        >
                                            예약 취소
                                        </Button>
                                    ) : b.status === "REFUNDED" ? (
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

            {/* 투숙객 모달 */}
            <Modal
                open={!!selectedGuests}
                title="투숙객 정보"
                footer={null}
                onCancel={() => setSelectedGuests(null)}
            >
                {selectedGuests ? (
                    <Descriptions bordered size="small" column={1}>
                        {selectedGuests.map((g, i) => (
                            <Descriptions.Item key={i} label={`투숙객 ${i + 1}`}>
                                {g.name} / {g.gender} / {g.birth}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                ) : (
                    <p>투숙객 정보가 없습니다.</p>
                )}
            </Modal>
        </MainLayout>
    );
};

export default UserMyAccommodationsPage;