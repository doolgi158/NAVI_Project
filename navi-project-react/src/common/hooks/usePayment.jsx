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

/* ============================================================
   [usePayment Hook]
   PortOne(아임포트) 결제 전체 흐름
   1️⃣ 결제 ID 생성 → 2️⃣ PortOne 결제 → 3️⃣ 검증 → 4️⃣ 확정(DB 반영)
   ------------------------------------------------------------
   - ACC / FLY: 검증 후 confirmPayment() 별도 호출
   - DLV: verify 단계에서 이미 confirmPayment()까지 처리됨
   ============================================================ */
export const usePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const payment = useSelector((state) => state.payment);
  const { reserveId, rsvType, formData, totalAmount, paymentMethod } = payment;

  // ✅ 중복 실행 방지 flag
  let isProcessing = false;
  let isConfirmed = false;

  const executePayment = async () => {
    if (isProcessing) {
      console.warn("⚠️ 결제 진행 중입니다. 중복 호출 방지됨.");
      return;
    }
    isProcessing = true;

    const amount =
      totalAmount ||
      formData?.totalAmount ||
      formData?.totalPrice ||
      0;

    if (!amount || amount <= 0) {
      message.error("결제 금액이 유효하지 않습니다.");
      console.warn("❌ [usePayment] 유효하지 않은 결제 금액:", amount);
      isProcessing = false;
      return;
    }

    let IMP;
    try {
      IMP = initIamport();
      if (!IMP) throw new Error("아임포트 SDK 로드 실패");
    } catch (error) {
      message.error(error.message || "SDK 초기화 오류");
      isProcessing = false;
      return;
    }

    try {
      // === 1️⃣ 결제 ID 생성 ===
      const prepareRes = await preparePayment({
        rsvType: rsvType?.toUpperCase(),
        reserveId: Array.isArray(reserveId) ? reserveId : [reserveId],
        totalAmount: amount,
        paymentMethod,
      });
      const merchantId = prepareRes.merchantId;
      console.log("✅ [usePayment] 결제 ID 생성 완료:", merchantId);

      // === 2️⃣ PG 설정 ===
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
        case "KGINIPAY":
          pg = "html5_inicis.INIpayTest";
          pay_method = "KGINIPAY";
          break;
        default:
          pg = "kakaopay.TC0ONETIME";
          pay_method = "KAKAOPAY";
      }

      const payData = {
        pg,
        pay_method,
        merchant_uid: merchantId,
        name: `${rsvType} 예약 결제`,
        amount,
        buyer_name: formData?.name || formData?.senderName || "NAVI 사용자",
        buyer_tel: formData?.phone || "01000000000",
        buyer_email: formData?.email || "navi@example.com",
      };

      console.log("✅ [usePayment] PortOne 결제 요청 데이터:", payData);

      // === 3️⃣ PortOne 결제 실행 ===
      IMP.request_pay(payData, async (rsp) => {
        if (!rsp.success) {
          message.error(`❌ 결제 실패: ${rsp.error_msg || "알 수 없는 오류"}`);
          navigate("/payment/result", {
            state: { error: rsp.error_msg || "결제 실패" },
          });
          isProcessing = false;
          return;
        }

        try {
          // === 4️⃣ 결제 검증 ===
          const verifyRes = await verifyPayment({
            rsvType,
            reserveId: Array.isArray(reserveId) ? reserveId : [reserveId],
            impUid: rsp.imp_uid,
            merchantId: rsp.merchant_uid,
            totalAmount: rsp.paid_amount,
          });
          dispatch(setVerifyData(verifyRes));

          // === 5️⃣ 결제 확정(DB 반영)
          // ACC / FLY: confirm API 별도 호출
          // DLV: verify 단계에서 이미 confirm 완료
          if (rsvType !== "DLV" && !isConfirmed) {
            isConfirmed = true;
            const confirmRes = await confirmPayment({
              merchantId: rsp.merchant_uid,
              rsvType,
              impUid: rsp.imp_uid,
              paymentMethod,
              reserveId: Array.isArray(reserveId) ? reserveId : [reserveId],
            });
            dispatch(setDetailData(confirmRes));
            console.log("✅ [usePayment] confirmPayment() 완료:", confirmRes);
          } else if (rsvType === "DLV") {
            console.log("✅ [DLV] verify 단계에서 이미 결제 확정 완료 → confirm 생략");
          } else {
            console.warn("⚠️ confirmPayment() 중복 호출 방지됨");
          }

          // === 6️⃣ 완료 후 페이지 이동 ===
          message.success("결제가 완료되었습니다.");
          navigate("/payment/result", {
            state: {
              impUid: rsp.imp_uid,
              merchantId: rsp.merchant_uid,
            },
          });

          dispatch(clearPaymentData());
        } catch (error) {
          console.error("❌ [usePayment] 검증/DB 반영 오류:", error);
          message.error("결제 검증 중 오류가 발생했습니다.");
          navigate("/payment/result", {
            state: { error: "결제 승인 검증에 실패했습니다." },
          });
        } finally {
          isProcessing = false;
        }
      });
    } catch (err) {
      console.error("❌ [usePayment] 결제 오류:", err);
      message.error("결제 처리 중 오류가 발생했습니다.");
      isProcessing = false;
    }
  };

  return { executePayment };
};
