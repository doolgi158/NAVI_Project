import MainLayout from "../../layout/MainLayout";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Card,
  Typography,
  Steps,
  Button,
  Radio,
  Divider,
  Space,
  message,
} from "antd";
import { setPaymentData } from "../../../common/slice/paymentSlice";
import { usePayment } from "../../../common/hooks/usePayment";

// 예약 타입별 컴포넌트
import AccRsvInfo from "../../../common/components/reservation/AccRsvInfo";
import FlyRsvInfo from "../../../common/components/reservation/FlyRsvInfo";
import DlvRsvInfo from "../../../common/components/reservation/DlvRsvInfo";

// 우측 요약 카드
import AccSummaryCard from "../../../common/components/reservation/AccRsvSumCard";
import FlySummaryCard from "../../../common/components/reservation/FlyRsvSumCard";
import DlvSummaryCard from "../../../common/components/reservation/DlvRsvSumCard";

const { Title, Text } = Typography;

const PaymentPage = () => {
  const navigate = useNavigate();
  const { executePayment } = usePayment();
  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ location.state 안전 추출
  const state = location.state;
  const rsvType = state?.rsvType || null;
  const items = state?.items || null;
  const formData = state?.formData || null;

  const [paymentMethod, setPaymentMethod] = useState("KAKAOPAY");
  const [loading, setLoading] = useState(false);

  // ✅ 총 결제 금액 계산
  const totalAmount = formData?.totalPrice || formData?.totalAmount || 0;

  // ✅ state 누락 시 홈으로 리다이렉트
  useEffect(() => {
    if (!state) {
      message.warning("잘못된 접근입니다. 메인으로 이동합니다.");
      navigate("/");
      return;
    }
  }, [state, navigate]);

  // ✅ Redux에 결제 금액 저장
  useEffect(() => {
    if (totalAmount && totalAmount > 0) {
      dispatch(setPaymentData({ totalAmount }));
      console.log("✅ [PaymentPage] 결제 금액 Redux 저장 완료:", totalAmount);
    } else {
      console.warn("⚠️ 결제 금액이 유효하지 않음:", totalAmount);
    }
  }, [dispatch, totalAmount]);

  // ✅ 예약 유형별 Info 컴포넌트 선택
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

  // ✅ 우측 카드 선택
  const SummaryCard = useMemo(() => {
    switch (rsvType) {
      case "ACC":
        return (
          <AccSumCard
            accData={items}
            totalAmount={totalAmount}
            formData={formData}
          />
        );
      case "FLY":
        return (
          <FlySumCard
            selectedOutbound={formData?.selectedOutbound}
            selectedInbound={formData?.selectedInbound}
          />
        );
      case "DLV":
        return (
          <DlvSumCard
            formData={formData}
            totalAmount={totalAmount}
          />
        );
      default:
        return (
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
        );
    }
  }, [rsvType, items, formData, totalAmount]);

  // ✅ 결제 버튼 클릭
  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      dispatch(
        setPaymentData({
          rsvType,
          reserveId: formData?.reserveId,
          totalAmount,
          paymentMethod,
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 150));
      await executePayment({ rsvType, formData, totalAmount, paymentMethod });
    } catch (error) {
      console.error("❌ [PaymentPage] 결제 처리 실패:", error);
      message.error("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ state가 비어 있을 때
  if (!rsvType || !formData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Text type="secondary">결제 정보를 불러오는 중입니다...</Text>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center pt-10 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 좌측 결제 영역 === */}
          <Card
            className="lg:col-span-2"
            style={{ borderRadius: 16, backgroundColor: "#FFFFFF" }}
          >
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

            {/* ✅ 타입별 상세 정보 */}
            {InfoComponent && items && formData ? (
              <InfoComponent
                data={typeof items === "object" ? items : {}}
                formData={typeof formData === "object" ? formData : {}}
              />
            ) : (
              <Text type="secondary">결제 정보가 없습니다.</Text>
            )}
          </Card>

          {/* === 우측 요약 카드 === */}
          <div className="flex flex-col justify-between h-full">
            {SummaryCard}

            {/* ✅ 결제 버튼 */}
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 24, height: 56, borderRadius: 12 }}
              loading={loading}
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
