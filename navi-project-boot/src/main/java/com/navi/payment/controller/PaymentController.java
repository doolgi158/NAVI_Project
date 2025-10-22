package com.navi.payment.controller;

import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
import com.navi.payment.service.PaymentRouterService;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {
    private final PaymentRouterService paymentRouterService;

    /* === [1. 결제 준비] === */
    @PostMapping("/prepare")
    public ResponseEntity<PaymentPrepareResponseDTO> preparePayment(@RequestBody PaymentPrepareRequestDTO dto) {
        log.info("✅ 결제 준비 요청 수신 - {}", dto);
        return ResponseEntity.ok(paymentRouterService.preparePayment(dto));
    }

    /* === [2. 결제 검증] === */
    @PostMapping("/verify")
    public ResponseEntity<PaymentResultResponseDTO> verifyPayment(@RequestBody PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {
        log.info("💳 [결제 검증 요청 수신] rsvType={}, merchantId={}, reserveIds={}",
                dto.getRsvType(), dto.getMerchantId(), dto.getReserveId());

        PaymentResultResponseDTO result = paymentRouterService.verifyAndCompletePayment(dto);

        log.info("✅ [결제 검증 완료] success={}, rsvStatus={}, merchantId={}",
                result.isSuccess(), result.getRsvStatus(), result.getMerchantId());

        return ResponseEntity.ok(result);
    }

    /* === [3. 결제 실패 처리] === */
    @PostMapping("/fail")
    public ResponseEntity<Void> failPayment(@RequestParam String merchantId,
                                            @RequestParam(required = false) String reason) {
        log.warn("❌ 결제 실패 처리 요청 - merchantId={}, reason={}", merchantId, reason);
        paymentRouterService.failPayment(merchantId, reason);
        return ResponseEntity.ok().build();
    }

    /* === [4. 환불 요청] === */
    @PostMapping("/refund")
    public ResponseEntity<Void> refundPayment(
            @RequestParam String merchantId,
            @RequestParam BigDecimal refundAmount,
            @RequestParam(required = false) String reason
    ) throws IamportResponseException, IOException {
        log.info("🔁 환불 요청 수신 - merchantId={}, amount={}, reason={}", merchantId, refundAmount, reason);
        paymentRouterService.refundPayment(merchantId, refundAmount, reason);
        return ResponseEntity.ok().build();
    }
}
