import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  setVerifyData,
  setDetailData,
  clearPaymentData,
} from "../slice/paymentSlice";
import {
  preparePayment,
  verifyPayment,
  confirmPayment,
} from "../api/paymentService";
import { initIamport } from "../util/iamport";

/**
 * ✅ PortOne(아임포트) 결제 전체 흐름 관리
 * 1. 결제 ID 생성 → 2. 결제 요청 → 3. 검증 → 4. DB 반영
 */
export const usePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Redux에서 결제 및 예약 데이터 가져오기
  const payment = useSelector((state) => state.payment);
  const reserveId = useSelector((state) => state.reservation?.reserveId); // ✅ 추가: 예약 ID 참조

  const executePayment = async ({
    rsvType,
    formData,
    totalAmount: externalTotal,
    paymentMethod: externalMethod,
  }) => {
    const totalAmount = externalTotal ?? payment.totalAmount;
    const paymentMethod = externalMethod ?? payment.paymentMethod;

    if (!totalAmount || totalAmount <= 0) {
      message.error("결제 금액이 유효하지 않습니다.");
      return;
    }

    let IMP;
    try {
      IMP = initIamport();
      if (!IMP) throw new Error("아임포트 SDK 로드 실패");
    } catch (error) {
      message.error(error.message || "SDK 초기화 오류");
      return;
    }

    try {
      // ✅ 1단계: 결제 ID 생성
      const prepareRes = await preparePayment({ totalAmount, paymentMethod });
      const merchantId = prepareRes.merchantId;
      console.log("✅ [usePayment] 결제 ID 생성 완료:", merchantId);

      // ✅ 2단계: PG 설정
      let pg, pay_method;
      switch (paymentMethod) {
        case "KAKAOPAY":
          pg = "kakaopay.TC0ONETIME";
          pay_method = "KAKAOPAY";
          break;
        case "TOSSPAY":
          pg = "tosspay.tosstest";
          pay_method = "TOSSPAY";
          break;
        default:
          pg = "html5_inicis.INIpayTest";
          pay_method = "KGINIPAY";
      }

      // ✅ 3단계: 결제 요청 데이터
      const payData = {
        pg,
        pay_method,
        merchant_uid: merchantId,
        name: `${rsvType} 예약 결제`,
        amount: totalAmount,
        buyer_name: formData?.name || formData?.senderName,
        buyer_tel: formData?.phone,
        buyer_email: formData?.email,
      };

      console.log("✅ [usePayment] PortOne 결제 요청 데이터:", payData);

      // ✅ 4단계: PortOne 결제 실행
      IMP.request_pay(payData, async (rsp) => {
        if (!rsp.success) {
          message.error(`❌ 결제 실패: ${rsp.error_msg || "알 수 없는 오류"}`);
          navigate("/payment/result", {
            state: { error: rsp.error_msg || "결제 실패" },
          });
          return;
        }

        try {
          // ✅ 5단계: 결제 검증 요청
          const verifyRes = await verifyPayment({
            impUid: rsp.imp_uid,
            merchantId: rsp.merchant_uid,
            totalAmount: rsp.paid_amount,
          });
          dispatch(setVerifyData(verifyRes));

          // ✅ 6단계: DB 반영 (confirm)
          const confirmRes = await confirmPayment({
            merchantId: rsp.merchant_uid,
            reserveType: rsvType,
            impUid: rsp.imp_uid,
            paymentMethod,
            items: [
              {
                reserveId: reserveId || "DLV_UNKNOWN", // ✅ Redux에서 예약 ID 가져오기
                amount:
                  formData?.totalAmount || formData?.totalPrice || rsp.paid_amount || 0,
              },
            ],
          });

          dispatch(setDetailData(confirmRes));

          // ✅ 7단계: 성공 시 result 페이지 이동
          message.success("✅ 결제가 완료되었습니다!");
          navigate("/payment/result", {
            state: {
              impUid: rsp.imp_uid,
              merchantId: rsp.merchant_uid,
            },
          });

          // ✅ navigate 이후 초기화
          dispatch(clearPaymentData());
        } catch (error) {
          console.error("❌ [usePayment] 검증/DB 반영 오류:", error);
          message.error("결제 검증 중 오류가 발생했습니다.");
          navigate("/payment/result", {
            state: { error: "결제 승인 검증에 실패했습니다." },
          });
        }
      });
    } catch (err) {
      console.error("❌ [usePayment] 결제 오류:", err);
      message.error("결제 처리 중 오류가 발생했습니다.");
    }
  };

  return { executePayment };
};
