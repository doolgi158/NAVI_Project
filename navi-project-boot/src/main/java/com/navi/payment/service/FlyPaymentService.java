package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.service.FlightReservationService;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
import com.navi.payment.repository.PaymentDetailRepository;
import com.navi.payment.repository.PaymentRepository;
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
public class FlyPaymentService {
    private final PaymentServiceImpl paymentService;
    private final PaymentDetailRepository paymentDetailRepository;
    private final FlightReservationService flightReservationService;
    private final PaymentRepository paymentRepository;

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
                flightReservationService.updateStatus(id, RsvStatus.FAILED.name());
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

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            log.warn("⚠️ [결제 검증] items 데이터가 비어있습니다. reserveIds={}", dto.getReserveId());
        } else {
            expectedTotal = dto.getItems().stream()
                    .map(item -> {
                        if (item == null) return BigDecimal.ZERO;

                        BigDecimal amount = BigDecimal.ZERO;
                        try {
                            if (item.getAmount() == null) {
                                log.warn("⚠️ [결제 검증] 금액 누락 - reserveId={} (null로 처리)", item.getReserveId());
                                return BigDecimal.ZERO;
                            }
                            amount = item.getAmount();
                            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                                log.warn("⚠️ [결제 검증] 금액이 음수입니다. reserveId={} amount={}",
                                        item.getReserveId(), amount);
                                return BigDecimal.ZERO;
                            }
                            log.debug("💰 [결제 검증] reserveId={} amount={}",
                                    item.getReserveId(), amount);
                            return amount;
                        } catch (Exception e) {
                            log.error("❌ [결제 검증] 금액 변환 오류 - reserveId={}, msg={}",
                                    item.getReserveId(), e.getMessage());
                            return BigDecimal.ZERO;
                        }
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal paidTotal = dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO;

        log.info("💰 [항공 금액 검증] reserveIds={} expectedTotal={} paid={}", dto.getReserveId(), expectedTotal, paidTotal);

        if (expectedTotal.compareTo(paidTotal) != 0) {
            for (String id : dto.getReserveId()) {
                flightReservationService.updateStatus(id, RsvStatus.FAILED.name());
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
            flightReservationService.updateStatus(id, RsvStatus.PAID.name());
            flightReservationService.updatePayment(id, dto.getTotalAmount());
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
            flightReservationService.updateStatus(id, RsvStatus.FAILED.name());
        }
        paymentService.failPayment(merchantId, reason);
    }

    /* 환불 처리 */
    // merchantId 단위 전체 환불
    @Transactional(rollbackFor = Exception.class)
    public void handleRefund(String merchantId, String reason)
            throws IamportResponseException, IOException {

        log.info("✈️ [FLY] 전체 환불 처리 시작 - merchantId={}", merchantId);

        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다. merchantId=" + merchantId));

        // 결제 환불은 공통 결제 서비스에서 처리
        paymentService.refundPayment(merchantId, master.getTotalAmount(), reason);

        master.getPaymentDetails().forEach(detail -> {
            try {
                flightReservationService.updateStatus(detail.getReserveId(), RsvStatus.REFUNDED.name());
            } catch (Exception e) {
                log.error("⚠️ [FLY] 예약 상태 변경 실패 - reserveId={}, msg={}", detail.getReserveId(), e.getMessage());
            }
        });

        log.info("✅ [FLY] 전체 환불 완료 (항공 예약 상태 갱신)");
    }

    // reserveId 단위 부분 환불
    @Transactional(rollbackFor = Exception.class)
    public void handlePartialRefund(String reserveId, String merchantId, String reason)
            throws IamportResponseException, IOException {

        log.info("✈️ [FLY] 부분 환불 처리 시작 - reserveId={}, merchantId={}", reserveId, merchantId);

        PaymentDetail detail = paymentDetailRepository.findAdminDetailsByReserveId(reserveId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("결제 상세 내역이 존재하지 않습니다."));

        BigDecimal refundAmount = detail.getAmount();

        paymentService.refundPayment(merchantId, refundAmount, reason);
        flightReservationService.updateStatus(reserveId, RsvStatus.REFUNDED.name());

        log.info("✅ [FLY] 부분 환불 완료 (예약 상태만 갱신)");
    }
}
