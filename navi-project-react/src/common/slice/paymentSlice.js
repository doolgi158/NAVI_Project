import { createSlice } from "@reduxjs/toolkit";

/* 결제/예약 관련 공통 상태 관리
: ACC(숙소) / FLY(항공) / DLV(짐배송) 모두 공용 */

const paymentSlice = createSlice({
	name: "payment",
	initialState: {
		rsvType: null,        // 예약 유형 구분 (ACC, FLY, DLV)
		reserveId: null,      // 예약 대상 ID
		itemData: null,		  // [ TODO ] :예약한 항목 데이터([])
		formData: null,       // 예약 입력 폼 데이터([])
		paymentMethod: null,  // 결제 수단
		merchantId: null,     // 결제 ID
		impUid: null,         // 포트원 승인번호
		totalAmount: 0,       // 총 결제 금액
	},

	reducers: {
		/* [ TODO ] :결제 전 예약 테이블에 들어간 정보를 Redux에 저장 */
		setReserveData: (state, action) => {
			const { reserveId, itemData } = action.payload;

			state.reserveId = reserveId;
			state.itemData = itemData;
		},

		/* 결제 ID 생성 시 필요한 데이터 */
		setPaymentData: (state, action) => {
			const { totalAmount } = action.payload;
			
			state.totalAmount = totalAmount;
		},

		/* 결제 검증 시 필요한 데이터 */
		setVerifyData: (state, action) => {
			const { impUid, merchantId, totalAmount } = action.payload;
			
			state.impUid = impUid;
			state.merchantId = merchantId;
			state.totalAmount = totalAmount;
		},

		/* 결제 완료시 결제 상세 테이블에 들어가는 데이터 */
		setDetailData: (state, action) => {
			const { merchantId, reserveId, rsvType, impUid, paymentMethod } = action.payload;
			
			state.merchantId = merchantId;
			state.reserveId = reserveId;
			state.rsvType = rsvType;
			state.impUid = impUid;
			state.paymentMethod = paymentMethod;
		},

		/* 결제 완료 후 or 페이지 이탈 시 데이터 초기화 */
		clearPaymentData: (state) => {
			state.rsvType = null;
			state.reserveId = null;
			state.formData = null;
			state.paymentMethod = null;
			state.merchantId = null;
			state.impUid = null;
			state.totalAmount = 0;
		},
	},
});

export const { setReserveData, setPaymentData, setVerifyData, setDetailData, clearPaymentData } = paymentSlice.actions;
export default paymentSlice.reducer;
