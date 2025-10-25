package com.navi.payment.service;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.request.RefundRequestDTO;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.siot.IamportRestClient.exception.IamportResponseException;

import java.io.IOException;
import java.util.List;

public interface PaymentAdminService {
    /* == 조회 전용 == */
    // 1. 결제 전체 조회 (필터링 포함)
    List<PaymentAdminListResponseDTO> getAllPaymentsForAdmin(
            RsvType rsvType, PaymentStatus paymentStatus, String keyword
    );

    // 2. 단일 결제 상세 조회
    List<PaymentAdminDetailResponseDTO> getPaymentDetailsForAdmin(String merchantId);

    // 3. 예약 ID별 환불(부분환불 가능 - FLY)
    void refundPaymentByReserveId(RefundRequestDTO dto)
            throws IamportResponseException, IOException, Exception;

    // 4. 결제 ID별 환불(전체환불)
    void refundPaymentByMerchantId(RefundRequestDTO dto)
            throws IamportResponseException, IOException, Exception;
}