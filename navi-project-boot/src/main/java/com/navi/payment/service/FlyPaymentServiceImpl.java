package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.service.FlightReservationService;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
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
public class FlyPaymentServiceImpl {
    private final PaymentServiceImpl paymentService;
    private final FlightReservationService flyRsvService;

    /* 결제 준비 */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("🛫 [FLY] 결제 준비 요청 - {}", dto);
        return paymentService.preparePayment(dto);
    }

    /* 결제 검증 및 확정 */
    @Transactional(rollbackFor = Exception.class)
    public PaymentResultResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto) {
        log.info("🛫 [FLY] 결제 검증 시작 → reserveIds={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        PaymentResultResponseDTO verifyRes;
        try {
            // PortOne 결제 검증
            verifyRes = paymentService.verifyPayment(dto);
        } catch (IamportResponseException | IOException e) {
            log.error("❌ [PortOne 검증 오류] {}", e.getMessage());
            paymentService.failPayment(dto.getMerchantId(), "PortOne 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("PortOne 결제 검증 실패")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }


        // PortOne 검증 실패
        if (verifyRes == null || !verifyRes.isSuccess()) {
            for (String id : dto.getReserveId()) {
                flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
            }
            paymentService.failPayment(dto.getMerchantId(), "PG 결제 검증 실패");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("PG 결제 검증 실패")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 금액 검증
        BigDecimal expectedTotal = BigDecimal.ZERO;
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            expectedTotal = dto.getItems().stream()
                    .map(item -> {
                        BigDecimal amount = BigDecimal.ZERO;
                        try {
                            if (item.getAmount() != null) {
                                amount = item.getAmount();
                            } else {
                                log.warn("⚠️ [금액 누락] reserveId={} amount=null", item.getReserveId());
                            }
                        } catch (Exception e) {
                            log.warn("⚠️ [금액 변환 오류] reserveId={}, msg={}", item.getReserveId(), e.getMessage());
                        }
                        return amount;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [항공 금액 검증] reserveIds={} expectedTotal={} paid={}", dto.getReserveId(), expectedTotal, paidTotal);

        if (expectedTotal.compareTo(paidTotal) != 0) {
            for (String id : dto.getReserveId()) {
                flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
            }
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            return PaymentResultResponseDTO.builder()
                    .success(false)
                    .message("결제 금액 불일치")
                    .merchantId(dto.getMerchantId())
                    .rsvStatus(RsvStatus.FAILED)
                    .build();
        }

        // 금액 일치 → 결제 확정(DB 반영)
        PaymentResultResponseDTO confirmRes = paymentService.confirmPayment(dto.toConfirmRequest());

        // 예약 상태 갱신
        for (String id : dto.getReserveId()) {
            flyRsvService.updateStatus(id, RsvStatus.PAID.name());
            flyRsvService.updatePayment(id, dto.getTotalAmount());
        }

        log.info("✅ [항공 결제 확정 완료] merchantId={}, reserveIds={}",
                dto.getMerchantId(), dto.getReserveId());

        return PaymentResultResponseDTO.builder()
                .success(true)
                .message("항공 결제 검증 및 확정 완료")
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .reserveIds(dto.getReserveId())
                .rsvStatus(RsvStatus.PAID)
                .build();
    }

    /* 결제 실패 */
    public void handlePaymentFailure(List<String> reserveIds, String merchantId, String reason) {
        log.warn("❌ [FLY] 결제 실패 처리 reserveIds={}, merchantId={}, reason={}",
                reserveIds, merchantId, reason);

        for (String id : reserveIds) {
            flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
        }
        paymentService.failPayment(merchantId, reason);
    }

    /* 환불 처리 */
    public void handleRefund(List<String> reserveIds, String merchantId, String reason) {
        log.info("💸 [FLY] 환불 처리 reserveIds={}, merchantId={}", reserveIds, merchantId);
        try {
            paymentService.refundPayment(merchantId, BigDecimal.ZERO, reason);
            for (String id : reserveIds) {
                flyRsvService.updateStatus(id, RsvStatus.REFUNDED.name());
            }
        } catch (Exception e) {
            log.error("❌ [FLY] 환불 처리 실패 reserveIds={}, msg={}", reserveIds, e.getMessage());
            throw new IllegalStateException("환불 처리 실패", e);
        }
    }
}
