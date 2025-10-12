import React from "react";

/**
 * ✅ PaymentButton
 * 결제 요청을 수행하는 공통 컴포넌트 (현재는 숙소 전용 테스트용)
 */
const PaymentButton = ({ amount, buyer, onSuccess }) => {
  const handlePayment = () => {
    const { IMP } = window; // 아임포트 객체 불러오기
    if (!IMP) {
      alert("결제 모듈이 로드되지 않았습니다. index.html 스크립트 확인하세요.");
      return;
    }

    // ✅ 테스트용 아임포트 가맹점 식별코드
    IMP.init("imp76209123");

    // ✅ 결제 요청 정보
    const data = {
      pg: "channel-key-554c1c37-6075-43e7-a698-ef5a10d268f0", // 카카오페이 테스트 채널
      pay_method: "card",
      merchant_uid: `order_${Date.now()}`, // 고유 주문번호
      name: "숙소 예약 결제 테스트",
      amount: amount, // 금액
      buyer_name: buyer.name,
      buyer_email: buyer.email,
      buyer_tel: buyer.phone,
    };

    // ✅ 결제창 호출
    IMP.request_pay(data, async (rsp) => {
      if (rsp.success) {
        console.log("✅ 결제 성공:", rsp);

        // 백엔드 검증 (지금은 콘솔만 확인)
        alert("결제 성공! imp_uid: " + rsp.imp_uid);
        onSuccess(rsp); // 부모 컴포넌트로 성공 결과 전달
      } else {
        alert("❌ 결제 실패: " + rsp.error_msg);
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
