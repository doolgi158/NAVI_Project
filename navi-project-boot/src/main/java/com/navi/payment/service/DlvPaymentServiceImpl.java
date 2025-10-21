package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.service.DeliveryReservationService;
import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DlvPaymentServiceImpl {
    private final DeliveryReservationService deliveryReservationService;
    private final PaymentServiceImpl paymentService;

    // 결제 준비 (merchantId 생성)
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("📦 [DLV] 결제 준비 요청 수신 - {}", dto);

        String reserveId = dto.getReserveId().get(0);
        DeliveryReservation reservation = deliveryReservationService.getReservationById(reserveId);

        if (reservation == null) {
            throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다. reserveId=" + reserveId);
        }

        PaymentPrepareResponseDTO response = paymentService.preparePayment(dto);

        log.info("✅ [DLV 결제 준비 완료] reserveId={}, merchantId={}", reserveId, response.getMerchantId());
        return response;
    }

    // 결제 검증 및 확정 처리
    @Transactional(rollbackFor = Exception.class)
    public PaymentResultResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {

        String reserveId = dto.getReserveId().get(0);
        log.info("📦 [DLV] 결제 검증 시작 → reserveId={}, merchantId={}, impUid={}",
                reserveId, dto.getMerchantId(), dto.getImpUid());

        PaymentResultResponseDTO verifyResult;
        try {
            verifyResult = paymentService.verifyPayment(dto);
        } catch (IamportResponseException | IOException e) {
            log.error("❌ [PortOne 검증 오류] {}", e.getMessage());
            paymentService.failPayment(dto.getMerchantId(), "PortOne 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("PortOne 검증 실패")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // PG 검증 실패 시
        if (verifyResult == null || !verifyResult.isSuccess()) {
            deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "PG 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("PG 검증 실패")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 금액 검증
        DeliveryReservation reservation = deliveryReservationService.getReservationById(reserveId);
        BigDecimal expectedAmount = reservation.getTotalPrice();
        BigDecimal paidAmount = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [DLV 금액 검증] reserveId={} expected={} paid={}", reserveId, expectedAmount, paidAmount);

        if (expectedAmount.compareTo(paidAmount) != 0) {
            deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("결제 금액 불일치")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 결제 확정(DB 반영)
        PaymentResultResponseDTO confirmRes = paymentService.confirmPayment(dto.toConfirmRequest());

        // 예약 상태 갱신
        deliveryReservationService.updateStatus(reserveId, RsvStatus.PAID.name());

        log.info("✅ [DLV 결제 확정 완료] reserveId={}, merchantId={}", reserveId, dto.getMerchantId());

        return PaymentResultResponseDTO.builder()
                .success(true)
                .message("결제 검증 및 확정 완료")
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .reserveIds(List.of(reserveId))
                .rsvStatus(RsvStatus.PAID)
                .build();
    }

    // 3. 결제 실패 (수동 처리)
    public void handlePaymentFailure(String reserveId, String merchantId, String reason) {
        log.warn("💥 [DLV] 결제 실패 처리 → reserveId={}, merchantId={}, reason={}",
                reserveId, merchantId, reason);
        deliveryReservationService.updateStatus(reserveId, RsvStatus.FAILED.name());
        paymentService.failPayment(merchantId, reason);
    }

    // 4. 환불 처리
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
