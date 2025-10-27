package com.navi.payment.service;

import com.navi.payment.dto.request.PaymentConfirmRequestDTO;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
import com.siot.IamportRestClient.exception.IamportResponseException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

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
    void refundPayment(String merchantId, BigDecimal refundAmount, String reason)
            throws IamportResponseException, IOException;

    // 결제 내역 출력
    List<PaymentAdminListResponseDTO> getMyPayments(String userId);
}
