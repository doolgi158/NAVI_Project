package com.navi.payment.controller;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.service.PaymentAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm/payment")
public class PaymentAdminController {
    private final PaymentAdminService paymentAdminService;

    @GetMapping("/list")
    public ResponseEntity<List<PaymentAdminListResponseDTO>> getAdminPayments(
            @RequestParam(required = false) RsvType rsvType,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) String keyword
    ) {
        List<PaymentAdminListResponseDTO> payments = paymentAdminService.getAllPaymentsForAdmin(rsvType, paymentStatus, keyword);

        if (payments.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 응답 (데이터 없음)
        }

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/details/{merchantId}")
    public ResponseEntity<List<PaymentAdminDetailResponseDTO>> getPaymentDetails(
            @PathVariable String merchantId
    ) {
        log.info("🔍 [ADMIN API] 단일 결제 상세 조회 요청 - merchantId={}", merchantId);

        List<PaymentAdminDetailResponseDTO> details =
                paymentAdminService.getPaymentDetailsForAdmin(merchantId);

        return ResponseEntity.ok(details);
    }

    @PostMapping("/refund/detail")
    public ResponseEntity<PaymentAdminListResponseDTO> refundByMerchantId(
            @RequestParam String merchantId,
            @RequestParam(defaultValue = "관리자 전체 환불") String reason
    ) throws Exception {
        log.info("💰 [ADMIN API] 전체 환불 요청 - merchantId={}, reason={}", merchantId, reason);

        PaymentAdminListResponseDTO refunded =
                paymentAdminService.refundPaymentByMerchantId(merchantId, reason);

        return ResponseEntity.ok(refunded);
    }
}
