package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.service.DeliveryReservationService;
import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
import com.siot.IamportRestClient.exception.IamportResponseException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

/* ============================================================
   [DlvPaymentServiceImpl]
   - 짐배송(DLV) 결제 검증 서비스
   - 예약 ID 단일 (List<String> 중 첫 번째만 사용)
   - PortOne 검증 → 금액 검증 → DB 상태 확정
   ============================================================ */

@Slf4j
@Service
@RequiredArgsConstructor
public class DlvPaymentServiceImpl {
    private final DeliveryReservationService deliveryReservationService;
    private final PaymentServiceImpl paymentService;

    /* 1️⃣ 결제 준비 (merchantId 생성) */
    @Transactional
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("📦 [DLV] 결제 준비 요청 수신 - {}", dto);

        // ✅ 단일 예약 ID (리스트의 첫 번째만 사용)
        String reserveId = dto.getReserveId().get(0);

        DeliveryReservation reservation =
                deliveryReservationService.getReservationById(reserveId);
        if (reservation == null) {
            throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다. reserveId=" + reserveId);
        }

        PaymentPrepareResponseDTO response = paymentService.preparePayment(dto);

        log.info("✅ [DLV 결제 준비 완료] reserveId={}, merchantId={}", reserveId, response.getMerchantId());
        return response;
    }

    /* 2️⃣ 결제 검증 및 확정 처리 */
    @Transactional
    public PaymentVerifyResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {

        String reserveId = dto.getReserveId().get(0);
        log.info("📦 [DLV] 결제 검증 시작 → reserveId={}, merchantId={}, impUid={}",
                reserveId, dto.getMerchantId(), dto.getImpUid());

        // ✅ 1️⃣ PortOne 서버 결제 상태 검증
        PaymentVerifyResponseDTO verifyResult = paymentService.verifyPayment(dto);

        if (verifyResult == null || !verifyResult.isSuccess()) {
            deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "PG 검증 실패");
            return PaymentVerifyResponseDTO.builder()
                    .success(false)
                    .message("PG 검증 실패")
                    .impUid(dto.getImpUid())
                    .merchantId(dto.getMerchantId())
                    .build();
        }

        // ✅ 2️⃣ DB 금액 검증
        DeliveryReservation reservation = deliveryReservationService.getReservationById(reserveId);
        BigDecimal expectedAmount = reservation.getTotalPrice();
        BigDecimal paidAmount = dto.getTotalAmount();

        if (expectedAmount.compareTo(paidAmount) != 0) {
            log.warn("❌ [DLV 금액 불일치] expected={}, paid={}", expectedAmount, paidAmount);
            deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            return PaymentVerifyResponseDTO.builder()
                    .success(false)
                    .message("결제 금액 불일치")
                    .impUid(dto.getImpUid())
                    .merchantId(dto.getMerchantId())
                    .build();
        }

        // ✅ 3️⃣ 결제 확정
        paymentService.confirmPayment(dto.toConfirmRequest());

        // ✅ 4️⃣ 예약 상태 갱신
        deliveryReservationService.updateStatus(reserveId, RsvStatus.PAID.name());

        log.info("✅ [DLV 결제 확정 완료] reserveId={}, merchantId={}", reserveId, dto.getMerchantId());

        return PaymentVerifyResponseDTO.builder()
                .success(true)
                .message("결제 및 예약 확정 완료")
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .build();
    }

    /* 3️⃣ 결제 실패 (수동 처리) */
    public void handlePaymentFailure(String reserveId, String merchantId, String reason) {
        log.warn("💥 [DLV] 결제 실패 처리 → reserveId={}, merchantId={}, reason={}",
                reserveId, merchantId, reason);
        deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
        paymentService.failPayment(merchantId, reason);
    }

    /* ============================================================
       ✅ 4️⃣ 환불 처리
    ============================================================ */
    public void handleRefund(String reserveId, String merchantId, String reason) {
        log.info("💸 [DLV] 환불 처리 요청 → reserveId={}, merchantId={}", reserveId, merchantId);
        try {
            paymentService.refundPayment(merchantId, BigDecimal.ZERO, reason);
            deliveryReservationService.updateStatus(reserveId, RsvStatus.REFUNDED.name());
        } catch (Exception e) {
            log.error("❌ [DLV] 환불 처리 실패 → msg={}", e.getMessage());
            throw new IllegalStateException("환불 처리 실패", e);
        }
    }
}
