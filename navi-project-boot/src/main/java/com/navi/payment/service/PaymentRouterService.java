package com.navi.payment.service;

import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentRouterService {

    private final AccPaymentServiceImpl accPaymentServiceImpl;
    private final DlvPaymentServiceImpl dlvPaymentServiceImpl;
    private final FlyPaymentServiceImpl flyPaymentServiceImpl;
    private final PaymentService paymentService; // 공통 결제 마스터 로직

    /* === 1. 결제 준비 === */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        return switch (dto.getRsvType()) {
            case ACC -> accPaymentServiceImpl.preparePayment(dto);
            case DLV -> dlvPaymentServiceImpl.preparePayment(dto);
            case FLY -> flyPaymentServiceImpl.preparePayment(dto);
        };
    }

    /* === 2. 결제 검증 및 확정 === */
    public PaymentVerifyResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {
        return switch (dto.getRsvType()) {
            case ACC -> accPaymentServiceImpl.verifyAndCompletePayment(dto);
            case DLV -> dlvPaymentServiceImpl.verifyAndCompletePayment(dto);
            case FLY -> flyPaymentServiceImpl.verifyAndCompletePayment(dto);
        };
    }

    /* === 3. 결제 확정 === */
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto) {
        return paymentService.confirmPayment(dto);
    }

    /* === 4. 결제 실패 === */
    public void failPayment(String merchantId, String reason) {
        paymentService.failPayment(merchantId, reason);
    }

    /* === 5. 환불 === */
    public void refundPayment(String merchantId, BigDecimal refundAmount, String reason)
            throws IamportResponseException, IOException {
        paymentService.refundPayment(merchantId, refundAmount, reason);
    }
}
