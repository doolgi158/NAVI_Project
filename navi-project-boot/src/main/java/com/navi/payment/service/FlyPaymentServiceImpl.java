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

    // 결제 준비 (merchantId 생성)
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("🛫 [FLY] 결제 준비 요청 - {}", dto);

        //  왕복일 경우 2개 예약 ID의 총액 합산
        BigDecimal totalAmount = flyRsvService.getTotalAmountByReserveIds(dto.getReserveId());
        dto.setTotalAmount(totalAmount);

        PaymentPrepareResponseDTO response = paymentService.preparePayment(dto);

        log.info("✅ [항공 결제 준비 완료] reserveIds={}, merchantId={}, totalAmount={}",
                dto.getReserveId(), response.getMerchantId(), totalAmount);

        return response;
    }

    // 결제 검증 및 확정 처리
    @Transactional(rollbackFor = Exception.class)
    public PaymentResultResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto) {
        log.info("🛫 [FLY] 결제 검증 시작 → reserveIds={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        PaymentResultResponseDTO verifyRes;
        try {
            // 1️⃣ PortOne 결제 검증
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

        // 2️⃣ PortOne 검증 실패
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

        // 3️⃣ 금액 검증
        BigDecimal expectedTotal = flyRsvService.getTotalAmountByReserveIds(dto.getReserveId());
        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [항공 금액 검증] reserveIds={} expected={} paid={}", dto.getReserveId(), expectedTotal, paidTotal);

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

        // 4️⃣ 금액 일치 → 결제 확정(DB 반영)
        PaymentResultResponseDTO confirmRes = paymentService.confirmPayment(dto.toConfirmRequest());

        // 5️⃣ 예약 상태 갱신
        for (String id : dto.getReserveId()) {
            flyRsvService.updateStatus(id, RsvStatus.PAID.name());
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

    // 3. 결제 실패 (수동 처리)
    public void handlePaymentFailure(List<String> reserveIds, String merchantId, String reason) {
        log.warn("❌ [FLY] 결제 실패 처리 reserveIds={}, merchantId={}, reason={}",
                reserveIds, merchantId, reason);

        for (String id : reserveIds) {
            flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
        }
        paymentService.failPayment(merchantId, reason);
    }

    // 4. 환불 처리
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
