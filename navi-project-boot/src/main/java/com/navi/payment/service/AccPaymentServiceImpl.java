package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
import com.navi.room.service.RoomRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.siot.IamportRestClient.exception.IamportResponseException;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccPaymentServiceImpl {
    private final PaymentServiceImpl paymentService;
    private final RoomRsvService roomRsvService;

    /* 결제 준비 */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("🏨 [ACC] 결제 준비 요청 - {}", dto);
        return paymentService.preparePayment(dto);
    }

    /* 결제 검증 및 확정 */
    @Transactional(rollbackFor = Exception.class)
    public PaymentResultResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto) {
        log.info("🏨 [ACC] 결제 검증 시작 → reserveId(s)={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        PaymentResultResponseDTO verifyRes;
        try {
            verifyRes = paymentService.verifyPayment(dto);
        } catch (IamportResponseException | IOException e) {
            log.error("❌ [PortOne 검증 오류] {}", e.getMessage());
            paymentService.failPayment(dto.getMerchantId(), "PortOne 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .merchantId(dto.getMerchantId())
                    .message("PortOne 결제 검증 실패")
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // PG 검증 실패
        if (verifyRes == null || !verifyRes.isSuccess()) {
            String firstId = dto.getReserveId().get(0);
            roomRsvService.updateStatus(firstId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "PG 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .merchantId(dto.getMerchantId())
                    .message("PG 결제 검증 실패")
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 예약 ID
        String reserveId = dto.getReserveId().get(0);

        BigDecimal expectedTotal = roomRsvService.getTotalAmountByReserveId(reserveId);
        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [금액 검증] reserveId={} expected={} paid={}", reserveId, expectedTotal, paidTotal);

        // 금액 불일치 시 실패 처리
        if (expectedTotal.compareTo(paidTotal) != 0) {
            roomRsvService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .merchantId(dto.getMerchantId())
                    .message("결제 금액 불일치")
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 금액 일치 시 결제 확정
        roomRsvService.updateStatus(reserveId, RsvStatus.PAID.name());
        PaymentResultResponseDTO confirmRes = paymentService.confirmPayment(dto.toConfirmRequest());

        log.info("✅ [결제 확정 완료] reserveId={}, merchantId={}", reserveId, dto.getMerchantId());

        return PaymentResultResponseDTO.builder()
                .success(true)
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .reserveIds(List.of(reserveId))
                .rsvStatus(RsvStatus.PAID)
                .message("결제 검증 및 확정 완료")
                .build();
    }

    /* 결제 실패 */
    public void handlePaymentFailure(String reserveId, String merchantId, String reason) {
        log.warn("💥 [ACC] 결제 실패 처리 reserveId={}, merchantId={}, reason={}", reserveId, merchantId, reason);
        roomRsvService.updateStatus(reserveId, RsvStatus.FAILED.name());
        paymentService.failPayment(merchantId, reason);
    }

    /* 환불 처리 */
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
