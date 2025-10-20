package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentVerifyResponseDTO;
import com.navi.room.service.RoomRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.siot.IamportRestClient.exception.IamportResponseException;

import java.io.IOException;
import java.math.BigDecimal;

/* ============================================================
   [AccPaymentServiceImpl]
   - 숙소(ACC) 결제 검증 서비스
   - 예약 ID별 객실 합산 금액 검증 + 상태 업데이트 + Payment 연동
   ============================================================ */

@Slf4j
@Service
@RequiredArgsConstructor
public class AccPaymentServiceImpl {

    private final PaymentServiceImpl paymentService;
    private final RoomRsvService roomRsvService;

    /* ✅ 1️⃣ 결제 준비 */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("🏨 [ACC] 결제 준비 요청 - {}", dto);
        return paymentService.preparePayment(dto);
    }

    /* ✅ 2️⃣ 결제 검증 */
    public PaymentVerifyResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto) {
        log.info("🏨 [ACC] 결제 검증 시작 → reserveId(s)={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        PaymentVerifyResponseDTO verifyRes;
        try {
            verifyRes = paymentService.verifyPayment(dto);
        } catch (IamportResponseException | IOException e) {
            log.error("❌ [PortOne 검증 오류] {}", e.getMessage());
            throw new IllegalStateException("PortOne 결제 검증 실패", e);
        }

        if (verifyRes == null || !verifyRes.isSuccess()) {
            String firstId = dto.getReserveId().get(0); // ✅ 리스트 첫 번째만 사용
            roomRsvService.updateStatus(firstId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "PG 검증 실패");
            throw new IllegalStateException("PG 결제 검증 실패");
        }

        // ✅ 예약 ID 단일 (숙소는 항상 1개)
        String reserveId = dto.getReserveId().get(0);

        BigDecimal expectedTotal = roomRsvService.getTotalAmountByReserveId(reserveId);
        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [금액 검증] reserveId={} expected={} paid={}", reserveId, expectedTotal, paidTotal);

        if (expectedTotal.compareTo(paidTotal) != 0) {
            roomRsvService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            throw new IllegalStateException("결제 금액 불일치");
        }

        // ✅ 금액 일치 시 결제 확정
        roomRsvService.updateStatus(reserveId, RsvStatus.PAID.name());
        paymentService.confirmPayment(dto.toConfirmRequest());

        log.info("✅ [결제 확정 완료] reserveId={}, merchantId={}", reserveId, dto.getMerchantId());
        return PaymentVerifyResponseDTO.builder()
                .success(true)
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .message("결제 검증 및 확정 완료")
                .build();
    }

    /* ✅ 3️⃣ 결제 실패 */
    public void handlePaymentFailure(String reserveId, String merchantId, String reason) {
        log.warn("💥 [ACC] 결제 실패 처리 reserveId={}, merchantId={}, reason={}", reserveId, merchantId, reason);
        roomRsvService.updateStatus(reserveId, RsvStatus.FAILED.name());
        paymentService.failPayment(merchantId, reason);
    }

    /* ✅ 4️⃣ 환불 처리 */
    public void handleRefund(String reserveId, String merchantId, String reason) {
        log.info("💸 [ACC] 환불 처리 reserveId={}, merchantId={}", reserveId, merchantId);
        try {
            paymentService.refundPayment(merchantId, BigDecimal.ZERO, reason);
            roomRsvService.updateStatus(reserveId, RsvStatus.REFUNDED.name());
        } catch (Exception e) {
            log.error("❌ [ACC] 환불 처리 실패 reserveId={}, msg={}", reserveId, e.getMessage());
            throw new IllegalStateException("환불 처리 실패", e);
        }
    }
}
