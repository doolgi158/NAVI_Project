import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { Card, Typography, Steps, Button, Radio, Divider, Space, message } from "antd";
import axios from "axios";



// ✅ 항목별 Info 컴포넌트만 import
import AccRsvInfo from "../../../common/components/reservation/AccRsvInfo";
import FlyRsvInfo from "../../../common/components/reservation/FlyRsvInfo";
import DlvRsvInfo from "../../../common/components/reservation/DlvRsvInfo";

const { Title, Text } = Typography;

const PaymentPage = ({keyword}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rsvType, itemId, itemData, formData } = location.state || {};


  console.log("🧭 [PaymentPage] 전달된 state:", {
    rsvType,
    itemId,
    itemData,
    formData,
  });

  const [paymentMethod, setPaymentMethod] = React.useState("kakaopay");

  // ✅ 타입별 Info 컴포넌트 분기
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

  const totalAmount = formData?.totalAmount || itemData?.price || 0;

  /** ✅ 결제 요청 함수 */
  const handlePayment = async () => {
    const { IMP } = window;
    if (!IMP) {
      alert("아임포트 SDK가 로드되지 않았습니다.");
      return;
    }

    let reserveId = null;
    try {
      const preRes = await axios.post(`/api/${rsvType.toLowerCase()}/pre`, {
        userNo: 1,
        rsvType,
        targetId: itemId,
        totalAmount,
        ...formData,
      });
      reserveId = preRes.data.reserveId;
      console.log(`🆔 [${rsvType}] 예약번호 발급:`, reserveId);
    } catch (err) {
      console.error("❌ 예약번호 생성 실패:", err);
      message.error("예약정보 생성 실패");
      return;
    }

    const iamportCode = import.meta.env.VITE_IAMPORT_CODE;
    IMP.init(iamportCode);

    let pg, channelKey;
    switch (paymentMethod) {
      case "kakaopay":
        pg = "kakaopay.TC0ONETIME";
        channelKey = import.meta.env.VITE_KAKAOPAY_CHANNEL_KEY;
        break;
      case "tosspay":
        pg = "tosspay.tosstest";
        channelKey = import.meta.env.VITE_TOSSPAY_CHANNEL_KEY;
        break;
      default:
        pg = "html5_inicis.INIpayTest";
        channelKey = import.meta.env.VITE_INIPAY_CHANNEL_KEY;
    }

    const paymentData = {
      pg,
      pay_method: "card",
      merchant_uid: reserveId,
      name: `${rsvType} 예약 결제`,
      amount: totalAmount,
      buyer_name: formData?.name,
      buyer_tel: formData?.phone,
      buyer_email: formData?.email,
      custom_data: { reserveId, rsvType, itemId, channelKey },
    };

    IMP.request_pay(paymentData, async (rsp) => {
      if (!rsp.success) {
        message.error(`결제 실패: ${rsp.error_msg}`);
        return;
      }

      try {
        const verifyRes = await axios.post(`/api/payment/verify`, {
          reserveId,
          impUid: rsp.imp_uid,
          merchantUid: rsp.merchant_uid,
          payMethod: paymentMethod,
          channelKey,
        });

        const confirmRes = await axios.post(`/api/${rsvType.toLowerCase()}/reserve/detail`, {
          reserveId,
          totalAmount,
          ...formData,
        });

        navigate(`/reservation/${rsvType.toLowerCase()}/result`, {
          state: {
            success: true,
            reservation: confirmRes.data,
            payment: verifyRes.data,
          },
        });
      } catch (err) {
        console.error("❌ 검증/확정 실패:", err);
        message.error("결제 검증 또는 예약 확정 실패");
      }
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center pt-10 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 좌측 결제 영역 === */}
          <Card className="lg:col-span-2" style={{ borderRadius: 16, backgroundColor: "#FFFFFF" }}>
            <Steps
              current={1}
              items={[{ title: "정보 입력" }, { title: "결제 진행" }, { title: "완료" }]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3}>결제 진행</Title>

            {/* ✅ 결제 수단 선택 */}
            <div className="mb-8">
              <Title level={5}>결제 수단 선택</Title>
              <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                <Space direction="vertical">
                  <Radio value="kakaopay">카카오페이</Radio>
                  <Radio value="tosspay">토스페이</Radio>
                  <Radio value="inipay">KG이니시스</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            {/* ✅ 예약자 공통 정보 */}
            <div className="space-y-2 mb-6">
              <Title level={5}>예약자 정보</Title>
              <Text>이름: {formData?.name}</Text><br />
              <Text>연락처: {formData?.phone}</Text><br />
              <Text>이메일: {formData?.email}</Text>
            </div>

            {/* ✅ 타입별 예약 상세 정보 */}
            {InfoComponent && <InfoComponent data={itemData} formData={formData} />}
          </Card>

          {/* === 우측 요약 div (버터옐로우) === */}
          <div className="flex flex-col justify-between h-full">
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#FFFBEA",
              }}
              styles={{
                body: { padding: "24px" },
              }}
            >
              <Title level={4} className="text-gray-800 mb-3 text-center">
                {itemData?.title || itemData?.accName || "예약 요약"}
              </Title>

              {itemData?.image && (
                <img
                  src={itemData.image}
                  alt="예약 이미지"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <Text className="block text-gray-600 mb-2 text-center">
                총 결제 금액:
                <span className="text-blue-600 font-bold text-lg ml-1">
                  {totalAmount.toLocaleString()}원
                </span>
              </Text>
            </Card>

            {/* 결제 버튼 */}
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
