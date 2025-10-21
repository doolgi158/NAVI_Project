package com.navi.payment.service;

import com.navi.payment.dto.request.PaymentConfirmRequestDTO;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
import com.siot.IamportRestClient.exception.IamportResponseException;

import java.io.IOException;
import java.math.BigDecimal;

public interface PaymentService {
    /* == 결제 플로우 == */
    // 1. 결제 준비 (merchantID 생성 및 임시 저장)
    PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto);
    // 2. 포트원 결제 검증
    PaymentResultResponseDTO verifyPayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException;
    // 3. 검증 성공 시 DB 반영 (검증 성공 시 결제 완료 처리 및 상세 저장)
    PaymentResultResponseDTO confirmPayment(PaymentConfirmRequestDTO dto);
    // 4. 결제 실패 시 상태 갱신
    void failPayment(String merchantId, String reason);
    // 5. 환불 요청 및 상태 변경
    void  refundPayment(String merchantId, BigDecimal refundAmount, String reason)
            throws IamportResponseException, IOException;


    /* == 조회 전용 == */
    // 1. 결제 단건 상세 조회 (마이페이지 등)
    //PaymentDetailResponseDTO getPaymentDetail(String merchantId);
    // 2. 결제 상태별 조회 (관리자용, 예: FAILED, PAID 등)
    //List<PaymentDetailResponseDTO> getPaymentsByStatus(String status);

    // TODO: 통계 전용응 매퍼 패키지에 기술할 예정
}
