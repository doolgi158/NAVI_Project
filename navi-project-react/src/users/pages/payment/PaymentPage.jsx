import MainLayout from "../../layout/MainLayout";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Typography, Steps, Button, Radio, Divider, Space, message } from "antd";
import { setPaymentData } from "../../../common/slice/paymentSlice";
import { usePayment } from "../../../common/hooks/usePayment";

import AccRsvInfo from "../../../common/components/reservation/AccRsvInfo";
import FlyRsvInfo from "../../../common/components/reservation/FlyRsvInfo";
import DlvRsvInfo from "../../../common/components/reservation/DlvRsvInfo";

const { Title, Text } = Typography;

const PaymentPage = () => {
  const { executePayment } = usePayment();
//   const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  /** ✅ location.state에서 전달된 데이터 */
  const { rsvType, items, formData } = location.state || {};
  const [paymentMethod, setPaymentMethod] = React.useState("KAKAOPAY");

  const totalAmount = formData?.totalPrice || formData?.totalAmount || 0;
  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) {
      message.warning("결제 금액이 유효하지 않습니다.");
      return;
    }
    dispatch(setPaymentData({ totalAmount }));
    console.log("✅ [PaymentPage] 결제 금액 Redux 저장 완료:", totalAmount);
  }, [dispatch, totalAmount]);

  /** ✅ 예약 유형별 Info 컴포넌트 선택 */
  const InfoComponent = useMemo(() => {
    switch (rsvType) {
      case "ACC":
        return AccRsvInfo;
      case "FLY":
        return FlyRsvInfo;
      case "DLV":
        return DlvRsvInfo;
      default:
        return null;
    }
  }, [rsvType]);

  /** ✅ 결제 버튼 클릭 시 실행 */
  const handlePayment = async () => {
  try {
    // Redux 상태 저장
    dispatch(setPaymentData({ totalAmount, paymentMethod }));

    // Redux 반영 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 실행 (navigate는 usePayment 내부에서)
    await executePayment({ rsvType, formData, totalAmount, paymentMethod });
  } catch (error) {
    console.error("❌ [PaymentPage] 결제 처리 실패:", error);
    message.error("결제 처리 중 오류가 발생했습니다.");
  }
};

  /** ✅ 데이터 로그 (디버그용) */
  console.log("[PaymentPage] location.state:", { rsvType, items, formData });

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center pt-10 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 좌측 결제 영역 === */}
          <Card className="lg:col-span-2" style={{ borderRadius: 16, backgroundColor: "#FFFFFF" }}>
            <Steps
              current={1}
              items={[
                { title: "정보 입력" },
                { title: "결제 진행" },
                { title: "완료" },
              ]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3}>결제 진행</Title>

            {/* ✅ 결제 수단 선택 */}
            <div className="mb-8">
              <Title level={5}>결제 수단 선택</Title>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
              >
                <Space direction="vertical">
                  <Radio value="KAKAOPAY">카카오페이</Radio>
                  <Radio value="TOSSPAY">토스페이</Radio>
                  <Radio value="KGINIPAY">KG이니시스</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            {/* ✅ 예약자 정보 */}
            <div className="space-y-2 mb-6">
              <Title level={5}>예약자 정보</Title>
              <Text>이름: {formData?.name || formData?.senderName || "정보 없음"}</Text>
              <br />
              <Text>연락처: {formData?.phone || "정보 없음"}</Text>
              <br />
              <Text>이메일: {formData?.email || "정보 없음"}</Text>
            </div>

            {/* ✅ 타입별 예약 상세 정보 */}
            {InfoComponent && items && formData ? (
  <InfoComponent
    data={typeof items === "object" ? items : {}}
    formData={typeof formData === "object" ? formData : {}}
  />
) : (
  <Text type="secondary">결제 정보가 없습니다.</Text>
)}

          </Card>

          {/* === 우측 요약 === */}
          <div className="flex flex-col justify-between h-full">
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#FFFBEA",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Title level={4} className="text-gray-800 mb-3 text-center">
                {typeof items?.title === "string" ? items.title : "예약 요약"}
              </Title>

              <Text className="block text-gray-600 mb-2 text-center">
                총 결제 금액:
                <span className="text-blue-600 font-bold text-lg ml-1">
                  {totalAmount.toLocaleString()}원
                </span>
              </Text>
            </Card>

            {/* ✅ 결제 버튼 */}
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 24, height: 56, borderRadius: 12 }}
              onClick={handlePayment}
            >
              결제하기
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentPage;
