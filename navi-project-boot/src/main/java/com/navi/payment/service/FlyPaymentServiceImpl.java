package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.common.enums.RsvType;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.service.FlightReservationService;
import com.navi.payment.dto.request.PaymentConfirmRequestDTO;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentVerifyResponseDTO;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

/* ============================================================
   [FlyPaymentServiceImpl]
   ✈️ 항공(FLY) 결제 검증 서비스
   - 편도/왕복 구조 (reserveIds 최대 2개)
   - 각 예약 ID별 금액 검증 후 합산 검증 + 결제 확정
   ============================================================ */

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FlyPaymentServiceImpl {

    private final PaymentServiceImpl paymentService;
    private final FlightReservationService flyRsvService;

    /* ============================================================
       ✅ 1️⃣ 결제 준비 (왕복 총액 계산 포함)
    ============================================================ */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("🛫 [FLY] 결제 준비 요청 - {}", dto);

        // ✅ 왕복일 경우 2개 예약 ID의 총액 합산
        BigDecimal totalAmount = flyRsvService.getTotalAmountByReserveIds(dto.getReserveId());
        dto.setTotalAmount(totalAmount);

        PaymentPrepareResponseDTO response = paymentService.preparePayment(dto);

        log.info("✅ [항공 결제 준비 완료] reserveIds={}, merchantId={}, totalAmount={}",
                dto.getReserveId(), response.getMerchantId(), totalAmount);

        return response;
    }

    /* ============================================================
       ✅ 2️⃣ 결제 검증 및 확정 (PortOne 검증 → DB 상태 업데이트)
    ============================================================ */
    public PaymentVerifyResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto) {
        log.info("🛫 [FLY] 결제 검증 시작 → reserveIds={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        PaymentVerifyResponseDTO verifyRes;
        try {
            // 1️⃣ PortOne 결제 검증 요청
            verifyRes = paymentService.verifyPayment(dto);
        } catch (IamportResponseException | IOException e) {
            log.error("❌ [PortOne 검증 오류] {}", e.getMessage());
            throw new IllegalStateException("PortOne 결제 검증 실패", e);
        }

        // 2️⃣ PortOne 검증 실패 처리
        if (verifyRes == null || !verifyRes.isSuccess()) {
            log.warn("❌ [PortOne 검증 실패] impUid={}, reserveIds={}", dto.getImpUid(), dto.getReserveId());
            for (String id : dto.getReserveId()) {
                flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
            }
            paymentService.failPayment(dto.getMerchantId(), "PG 검증 실패");
            return PaymentVerifyResponseDTO.builder()
                    .success(false)
                    .message("PortOne 검증 실패")
                    .build();
        }

        // ✅ [3️⃣ DB상 왕복 총 금액 합산]
        BigDecimal expectedTotal = flyRsvService.getTotalAmountByReserveIds(dto.getReserveId());
        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [항공 금액 검증] reserveIds={} expected={} paid={}",
                dto.getReserveId(), expectedTotal, paidTotal);

        // ✅ [4️⃣ 금액 불일치 시 실패 처리]
        if (expectedTotal.compareTo(paidTotal) != 0) {
            for (String id : dto.getReserveId()) {
                flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
            }
            paymentService.failPayment(dto.getMerchantId(), "결제 금액 불일치");
            return PaymentVerifyResponseDTO.builder()
                    .success(false)
                    .message("결제 금액 불일치")
                    .build();
        }

        // ✅ [5️⃣ 결제 금액 일치 → 결제 확정 처리]
        for (String id : dto.getReserveId()) {
            flyRsvService.updateStatus(id, RsvStatus.PAID.name());
        }

        // ✅ PaymentConfirmRequestDTO 변환 후 결제 확정
        paymentService.confirmPayment(dto.toConfirmRequest());

        log.info("✅ [항공 결제 확정 완료] merchantId={}, reserveIds={}",
                dto.getMerchantId(), dto.getReserveId());

        return PaymentVerifyResponseDTO.builder()
                .success(true)
                .impUid(dto.getImpUid())
                .merchantId(dto.getMerchantId())
                .message("항공 결제 검증 및 확정 완료")
                .build();
    }

    /* ============================================================
       ✅ 3️⃣ 결제 실패 처리
    ============================================================ */
    public void handlePaymentFailure(List<String> reserveIds, String merchantId, String reason) {
        log.warn("💥 [FLY] 결제 실패 처리 reserveIds={}, merchantId={}, reason={}",
                reserveIds, merchantId, reason);

        for (String id : reserveIds) {
            flyRsvService.updateStatus(id, RsvStatus.FAILED.name());
        }
        paymentService.failPayment(merchantId, reason);
    }

    /* ============================================================
       ✅ 4️⃣ 환불 처리 (왕복 전체 환불)
    ============================================================ */
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
