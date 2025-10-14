import React from "react";

/**
 * ✅ PaymentButton
 * 결제 요청 공통 컴포넌트
 * - props:
 *    - amount: 결제 금액
 *    - buyer: { name, email, phone }
 *    - pgType: "kakaopay" | "tosspay" | "inipay"
 *    - onSuccess: 결제 성공 콜백
 */
const PaymentButton = ({ amount, buyer, pgType = "kakaopay", onSuccess }) => {
  const handlePayment = () => {
    const { IMP } = window;
    if (!IMP) {
      alert("아임포트 SDK가 로드되지 않았습니다. index.html을 확인하세요.");
      return;
    }

    // ✅ 아임포트 상점 코드 (환경변수에서)
    const iamportCode = import.meta.env.VITE_IAMPORT_CODE;
    IMP.init(iamportCode);

    // ✅ PG사별 코드 및 채널키 분기
    let pg, channelKey;
    switch (pgType) {
      case "kakaopay":
        pg = "kakaopay.TC0ONETIME";
        channelKey = import.meta.env.VITE_KAKAOPAY_CHANNEL_KEY;
        break;
      case "tosspay":
        pg = "tosspay.tosstest";
        channelKey = import.meta.env.VITE_TOSSPAY_CHANNEL_KEY;
        break;
      case "inipay":
        pg = "html5_inicis.INIpayTest";
        channelKey = import.meta.env.VITE_INIPAY_CHANNEL_KEY;
        break;
      default:
        pg = "kakaopay.TC0ONETIME";
        channelKey = import.meta.env.VITE_KAKAOPAY_CHANNEL_KEY;
    }

    // ✅ 결제 요청 데이터
    const data = {
      pg,
      pay_method: "card",
      merchant_uid: `order_${Date.now()}`,
      name: "숙소 예약 결제 테스트",
      amount: amount || 10000,
      buyer_name: buyer?.name || "홍길동",
      buyer_email: buyer?.email || "example@email.com",
      buyer_tel: buyer?.phone || "010-0000-0000",
      custom_data: { channelKey }, // 필요 시 백엔드 전달
    };

    console.log("💳 결제 요청 데이터:", data);

    // ✅ 결제창 호출
    IMP.request_pay(data, async (rsp) => {
      if (rsp.success) {
        console.log("✅ 결제 성공:", rsp);
        alert(`결제 성공! imp_uid: ${rsp.imp_uid}`);
        onSuccess?.(rsp);
      } else {
        alert(`❌ 결제 실패: ${rsp.error_msg}`);
      }
    });
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        backgroundColor: "#1677ff",
        color: "white",
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      결제하기
    </button>
  );
};

export default PaymentButton;
