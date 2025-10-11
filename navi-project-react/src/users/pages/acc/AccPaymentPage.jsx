import React from "react";
import { useParams, useLocation } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { Card, Typography, Steps, Button, Radio, Divider, Space } from "antd";

const { Title, Text } = Typography;

const AccPaymentPage = () => {
  const { accNo, roomId } = useParams();
  const location = useLocation();
  const { room, accName, formData } = location.state || {}; // 예약 페이지에서 전달받은 데이터

  const [paymentMethod, setPaymentMethod] = React.useState("kakaopay");

  // ✅ 아임포트 결제 요청 함수
  const handlePayment = () => {
    const { IMP } = window;
    if (!IMP) {
      alert("아임포트 SDK가 로드되지 않았습니다. index.html을 확인하세요.");
      return;
    }

    // ✅ 아임포트 테스트용 식별코드
    IMP.init("imp10391932");

    // ✅ 결제 요청 정보 구성
    const paymentData = {
      pg:
        paymentMethod === "kakaopay"
          ? "kakaopay.TC0ONETIME"
          : paymentMethod === "tosspay"
          ? "tosspayments.iamporttest_20240601"
          : "html5_inicis.INIpayTest", // 카드 결제용 테스트 PG
      pay_method: "card",
      merchant_uid: `order_${new Date().getTime()}`, // 고유 주문번호
      name: `${accName || "숙소"} 예약 결제`,
      amount: room?.price || 200000,
      buyer_name: formData?.name || "홍길동",
      buyer_tel: formData?.phone || "010-0000-0000",
      buyer_email: formData?.email || "example@email.com",
    };

    console.log("결제 요청 데이터:", paymentData);

    // ✅ 결제창 호출
    IMP.request_pay(paymentData, async (rsp) => {
      if (rsp.success) {
        console.log("✅ 결제 성공:", rsp);
        alert(`결제 성공!\n결제번호: ${rsp.imp_uid}\n주문번호: ${rsp.merchant_uid}`);

        // 👉 여기서 백엔드 검증 요청 (다음 단계에서 구현 예정)
        // await fetch("/api/payment/verify", { ... })
      } else {
        console.error("❌ 결제 실패:", rsp.error_msg);
        alert("결제 실패: " + rsp.error_msg);
      }
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FFFBEA] flex justify-center pt-10 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 왼쪽: 결제 정보 === */}
          <Card
            className="lg:col-span-2"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              backgroundColor: "#FFFFFF",
            }}
            styles={{
              body: { padding: "32px" },
            }}
          >
            <Steps
              current={1}
              items={[
                { title: "예약 정보 입력" },
                { title: "결제 진행" },
                { title: "예약 완료" },
              ]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3} className="mb-6 text-gray-800">
              결제 진행
            </Title>

            {/* ✅ 결제 수단 선택 */}
            <div className="mb-8">
              <Title level={5}>결제 수단 선택</Title>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className="mt-3"
              >
                <Space direction="vertical">
                  <Radio value="card">신용/체크카드</Radio>
                  <Radio value="kakaopay">카카오페이</Radio>
                  <Radio value="tosspay">토스페이</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            {/* ✅ 예약 정보 확인 */}
            <div className="space-y-2">
              <Title level={5}>예약 정보 확인</Title>
              <Text className="block text-gray-600">
                예약자명: <strong>{formData?.name || "홍길동"}</strong>
              </Text>
              <Text className="block text-gray-600">
                연락처: <strong>{formData?.phone || "010-0000-0000"}</strong>
              </Text>
              <Text className="block text-gray-600">
                이메일: <strong>{formData?.email || "example@email.com"}</strong>
              </Text>
              <Text className="block text-gray-600">
                숙박 일정:{" "}
                <strong>
                  {formData?.dateRange?.join(" ~ ") || "2025-10-10 ~ 2025-10-12"}
                </strong>
              </Text>
              <Text className="block text-gray-600">
                인원: <strong>{formData?.guestCount || 2}명</strong>
              </Text>
              <Text className="block text-gray-600 mt-4 text-lg">
                총 결제 금액:{" "}
                <span className="text-blue-600 font-bold text-xl">
                  {room?.price
                    ? `${room.price.toLocaleString()}원`
                    : "200,000원"}
                </span>
              </Text>
            </div>
          </Card>

          {/* === 오른쪽: 숙소 요약 === */}
          <div className="flex flex-col justify-between h-full">
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#FDF6D8",
              }}
              styles={{
                body: { padding: "24px" },
              }}
            >
              <div className="flex flex-col text-center mb-6">
                <Title level={4} className="text-gray-800 mb-3">
                  {accName || "숙소 이름"}
                </Title>

                <img
                  src={room?.image || "https://via.placeholder.com/300x200"}
                  alt={room?.type || "객실 이미지"}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <Title level={5} className="text-gray-700 mb-1">
                  {room?.type || "객실 정보 없음"}
                </Title>

                <Text className="block text-gray-500 mb-1">
                  숙소번호: {accNo}
                </Text>
                <Text className="block text-gray-500 mb-1">
                  객실번호: {roomId}
                </Text>
                <Text className="text-lg text-gray-600 mb-1">
                  최대 인원 {room?.max || "-"}명
                </Text>
                <Text className="text-2xl font-bold text-[#006D77] mb-2">
                  {room?.price
                    ? `${room.price.toLocaleString()}원 / 1박`
                    : "-"}
                </Text>
              </div>
            </Card>

            {/* ✅ 결제 버튼 */}
            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
                onClick={handlePayment}
              >
                결제하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccPaymentPage;
