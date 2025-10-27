import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Typography, Form, Input, Button, Steps, Divider, Space, message } from "antd";
import { CalendarOutlined, TeamOutlined, HomeOutlined, DollarOutlined } from "@ant-design/icons";
import { setReserveData } from "../../../common/slice/paymentSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { useEffect, useState } from "react"; 
import MainLayout from "../../layout/MainLayout";
import axios from "axios";

const { Title, Text } = Typography;

const cleanPhoneNumber = (phoneNumber) => phoneNumber.replace(/[^0-9]/g, "");
const formatPhoneNumber = (phoneNumber) => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    const len = cleaned.length;
    
    // 한국 휴대폰 번호 포맷팅 (010 기준)
    if (len <= 3) {
        return cleaned;
    }
    if (len <= 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    // 11자리 (010-XXXX-XXXX)
    if (len <= 11) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    return cleaned.slice(0, 11); // 최대 11자리까지만 허용
};

const AccReservationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    // 전화번호 상태 추가
    const [phoneNumber, setPhoneNumber] = useState(""); 

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.warning("로그인이 필요한 서비스입니다.");
            navigate("/", { replace: true });
        }
    }, [navigate]);

    /* location.state */
    const { rsvType, items, itemData, formData } = location.state || {};

    // 유효성 검사
    if (!formData || !itemData) {
        message.error("예약 정보가 올바르지 않습니다. 다시 시도해주세요.");
        navigate("/accommodations");
        return null;
    }

    // 전화번호 입력 핸들러: 자동 포맷팅 및 폼 상태 업데이트
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const formattedValue = formatPhoneNumber(value);
        setPhoneNumber(formattedValue);
        // Ant Design Form의 유효성 검사를 위해 폼 필드에도 값을 설정
        form.setFieldsValue({ phone: formattedValue });
    };

    /* 결제 페이지 이동 */
    const onFinish = async (values) => {
        const token = localStorage.getItem("accessToken");
        
        // 하이픈 제거된 순수 숫자 전화번호 (서버 전송용)
        const cleanedPhone = cleanPhoneNumber(values.phone); 

        try {
            // 예약자 정보 통합
            const updatedFormData = {
                ...formData,
                name: values.name,
                phone: cleanedPhone, // 클린한 전화번호 사용
                email: values.email,
            };

            // ✅ 예약자 정보 업데이트 요청
            await axios.put(`${API_SERVER_HOST}/api/room/reserve/${formData.reserveId}/reserver`,
                {
                    reserverName: values.name,
                    reserverTel: cleanedPhone, // 클린한 전화번호 전송
                    reserverEmail: values.email,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            message.success("예약자 정보가 저장되었습니다.");

            // ✅ Redux 상태 갱신
            dispatch(
                setReserveData({
                    rsvType,
                    reserveId: formData.reserveId,
                    itemData,
                    items,
                    formData: updatedFormData,
                })
            );

            // ✅ 결제 페이지로 이동
            navigate("/payment", {
                state: {
                    rsvType: "ACC",
                    itemData,
                    items,
                    formData: updatedFormData,
                },
            });
        } catch (err) {
            console.error("❌ 예약자 정보 업데이트 실패:", err);
            message.error("예약자 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };


    return (
        <MainLayout>
            <div className="flex justify-center py-10 px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
                    {/* === 왼쪽: 예약자 입력 폼 === */}
                    <Card
                        className="lg:col-span-2"
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                            backgroundColor: "#fff",
                            height: "fit-content",
                        }}
                    >
                        <Steps
                            current={0}
                            items={[
                                { title: "예약 정보 입력" },
                                { title: "결제 진행" },
                                { title: "예약 완료" },
                            ]}
                            style={{ marginBottom: 40 }}
                        />

                        <Title level={3} className="mb-6 text-gray-800">
                            대표 예약자 정보 입력
                        </Title>

                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item
                                label="이름"
                                name="name"
                                rules={[{ required: true, message: "이름을 입력해주세요." }]}
                            >
                                <Input placeholder="홍길동" size="large" />
                            </Form.Item>

                            <Form.Item
                                label="연락처"
                                name="phone"
                                rules={[
                                    { required: true, message: "연락처를 입력해주세요." },
                                    // ⭐ 전화번호 유효성 검사 규칙 추가
                                    { 
                                        validator: (_, value) => {
                                            const cleaned = cleanPhoneNumber(value);
                                            // 10자리 (구형 번호) 또는 11자리 (010)로 시작하며 0으로 시작하는지 확인
                                            if (!cleaned || (cleaned.length >= 10 && cleaned.length <= 11 && cleaned.startsWith('0'))) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'));
                                        }
                                    }
                                ]}
                            >
                                {/* ⭐ value와 onChange 핸들러를 추가하여 자동 하이픈 기능 구현 */}
                                <Input 
                                    placeholder="010-1234-5678" 
                                    size="large" 
                                    maxLength={13} // 010-0000-0000은 13자리
                                    value={phoneNumber} 
                                    onChange={handlePhoneChange}
                                />
                            </Form.Item>

                            <Form.Item
                                label="이메일"
                                name="email"
                                rules={[
                                    { required: true, message: "이메일을 입력해주세요." },
                                    { type: "email", message: "올바른 이메일 형식을 입력해주세요." },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input placeholder="example@email.com" size="large" />
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* === 오른쪽: 예약 요약 카드 === */}
                    <div className="flex flex-col justify-between h-full">
                        <Card
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                backgroundColor: "#fafafa",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div className="flex flex-col items-center text-center mb-6">
                                    <Title level={4} className="text-gray-900 mb-2">
                                        {itemData.accName || "숙소 이름"}
                                    </Title>
                                    <Text className="text-lg text-gray-700 font-medium mb-1">
                                        {itemData.room?.roomName || "객실 정보 없음"}
                                    </Text>
                                    <Text className="text-xl font-bold text-blue-600">
                                        {itemData.room?.weekdayFee
                                            ? `${itemData.room.weekdayFee.toLocaleString()}원 / 1박`
                                            : "가격 미정"}
                                    </Text>
                                </div>

                                <Divider style={{ margin: "12px 0" }} />

                                <Space
                                    direction="vertical"
                                    size="small"
                                    style={{ width: "100%", fontSize: "0.95rem" }}
                                >
                                    <Text>
                                        <CalendarOutlined className="text-gray-600 mr-2" />
                                        <b>숙박 일정:</b>{" "}
                                        {formData.checkIn && formData.checkOut
                                            ? `${formData.checkIn} ~ ${formData.checkOut} (${formData.nights}일)`
                                            : "선택되지 않음"}
                                    </Text>

                                    <Text>
                                        <TeamOutlined className="text-gray-600 mr-2" />
                                        <b>인원 수:</b> {formData.guestCount || 1}명
                                    </Text>

                                    <Text>
                                        <HomeOutlined className="text-gray-600 mr-2" />
                                        <b>객실 수:</b> {formData.roomCount || 1}개
                                    </Text>
                                </Space>

                                <Divider style={{ margin: "16px 0" }} />

                                <Text
                                    className="block text-base font-semibold text-gray-900 text-center"
                                >
                                    <DollarOutlined className="text-yellow-600 mr-2" />
                                    총 금액:{" "}
                                    <span className="text-blue-600 font-bold">
                                        {formData.totalAmount.toLocaleString()}원
                                    </span>
                                </Text>
                            </div>

                            {/* ✅ 하단 버튼 */}
                            <div className="mt-6">
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    style={{
                                        height: "50px",
                                        borderRadius: "10px",
                                        fontSize: "1.05rem",
                                        fontWeight: 600,
                                        marginTop: "20px",
                                    }}
                                    onClick={() => form.submit()}
                                >
                                    결제하기
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AccReservationPage;