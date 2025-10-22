import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { setVerifyData, clearPaymentData } from "../slice/paymentSlice";
import { preparePayment, verifyPayment } from "../api/paymentService";
import { initIamport } from "../util/iamport";
import { useRef } from "react";

/* =================================================================
	[usePayment Hook]
	결제 ID 생성 → PortOne 결제 → 검증 + 확정(DB 반영)
==================================================================== */

export const usePayment = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	
	const payment = useSelector((state) => state.payment);
	const { items, rsvType, formData, totalAmount, paymentMethod } = payment;

	const isProcessingRef = useRef(false);

	const executePayment = async () => {
		if (isProcessingRef.current) {
			console.warn("⚠️ 결제 진행 중입니다. 중복 호출 방지됨.");
			return;
		}
		isProcessingRef.current = true;

		const amount = totalAmount || formData?.totalAmount || formData?.totalPrice || 0;

		if (!amount || amount <= 0) {
			message.error("결제 금액이 유효하지 않습니다.");
			isProcessingRef.current = false;
			return;
		}

		/* 아임포트 초기화 */
		let IMP;
		try {
			IMP = initIamport();
			if (!IMP) throw new Error("아임포트 SDK 로드 실패");
		} catch (error) {
			message.error(error.message || "SDK 초기화 오류");
			isProcessingRef.current = false;
			return;
		}

		try {
			// 결제 ID 생성
			const pgMethod = paymentMethod || "KAKAOPAY";
			const reserveIds = items?.map((item) => item.reserveId) || [];

			const prepareRes = await preparePayment({
				rsvType: rsvType?.toUpperCase(),
				reserveId: reserveIds,
				totalAmount: amount,
				paymentMethod: pgMethod,
			});
			const merchantId = prepareRes.merchantId;

			// === 2️⃣ PG 설정 ===
			let pg;
			switch (pgMethod) {
				case "KAKAOPAY":
					pg = "kakaopay.TC0ONETIME";
					break;
				case "TOSSPAY":
					pg = "tosspay.tosstest";
					break;
				case "KGINIPAY":
					pg = "html5_inicis.INIpayTest";
					break;
				default:
					pg = "kakaopay.TC0ONETIME";
			}

			const payData = {
				pg,
				pay_method: pgMethod,
				merchant_uid: merchantId,
				name: `${rsvType} 예약 결제`,
				amount,
				buyer_name: formData?.name || formData?.senderName,
				buyer_tel: formData?.phone,
				buyer_email: formData?.email,
			};

			/* 결제 요청 */
			IMP.request_pay(payData, async (rsp) => {
				if (!rsp.success) {
					message.error(`❌ 결제 실패: ${rsp.error_msg || "알 수 없는 오류"}`);
					navigate("/payment/result", { state: { error: rsp.error_msg } });
					isProcessingRef.current = false;
					return;
				}

				try {
					// 결제 검증 + 확정 요청 
					const verifyPayload = {
						rsvType,
						reserveId: reserveIds,
						impUid: rsp.imp_uid,
						merchantId: rsp.merchant_uid,
						totalAmount: rsp.paid_amount,
						paymentMethod: pgMethod,
						items
					};

					const verifyRes = await verifyPayment(verifyPayload);
					dispatch(setVerifyData(verifyRes));

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
						state: { error: "결제 승인 검증 실패" },
					});
				} finally {
					isProcessingRef.current = false;
				}
			});
		} catch (err) {
			console.error("❌ [usePayment] 결제 오류:", err);
			message.error("결제 처리 중 오류가 발생했습니다.");
			isProcessingRef.current = false;
		}
	};

	return { executePayment };
};
