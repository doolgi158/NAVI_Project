package com.navi.payment.service;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
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
public class PaymentRouterService {
    private final AccPaymentServiceImpl accPaymentServiceImpl;
    private final DlvPaymentServiceImpl dlvPaymentServiceImpl;
    private final FlyPaymentServiceImpl flyPaymentServiceImpl;
    private final PaymentService paymentService; // 공통 결제 마스터 로직
    private final PaymentRepository paymentRepository;

    /* === 1. 결제 준비 === */
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        for (String rsvId : dto.getReserveId()) {
            log.info("✅ 결제 준비 - 예약 ID: {}", rsvId);
        }
        return switch (dto.getRsvType()) {
            case ACC -> accPaymentServiceImpl.preparePayment(dto);
            case DLV -> dlvPaymentServiceImpl.preparePayment(dto);
            case FLY -> flyPaymentServiceImpl.preparePayment(dto);
        };
    }

    /* === 2. 결제 검증 및 확정 === */
    public PaymentResultResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {
        return switch (dto.getRsvType()) {
            case ACC -> accPaymentServiceImpl.verifyAndCompletePayment(dto);
            case DLV -> dlvPaymentServiceImpl.verifyAndCompletePayment(dto);
            case FLY -> flyPaymentServiceImpl.verifyAndCompletePayment(dto);
        };
    }

    /* === 4. 결제 실패 === */
    public void failPayment(String merchantId, String reason) {
        paymentService.failPayment(merchantId, reason);
    }

    /* === 5. 환불 === */
    /* merchantId 단위 환불 */
    @Transactional(rollbackFor = Exception.class)
    public void refundByMerchantId(String merchantId, String reason)
            throws IamportResponseException, IOException, Exception {

        log.info("💳 [Router] 전체 환불 분기 시작 - merchantId={}", merchantId);

        // 결제 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다. merchantId=" + merchantId));

        // 예약 유형 확인
        List<PaymentDetail> details = master.getPaymentDetails();
        if (details.isEmpty()) {
            throw new IllegalStateException("결제 상세 내역이 존재하지 않습니다. (merchantId=" + merchantId + ")");
        }

        RsvType rsvType = details.get(0).getRsvType();
        log.info("🔍 [Router] 전체 환불 도메인 타입 확인 - {}", rsvType);

        // 각 도메인별 환불 처리 분기
        switch (rsvType) {
            case ACC -> accPaymentServiceImpl.handleRefund(merchantId, reason);
            case DLV -> dlvPaymentServiceImpl.handleRefund(merchantId, reason);
            case FLY -> flyPaymentServiceImpl.handleRefund(merchantId, reason);
            default -> throw new IllegalStateException("지원되지 않는 예약 유형입니다: " + rsvType);
        }

        log.info("✅ [Router] 전체 환불 완료 - merchantId={}, type={}", merchantId, rsvType);
    }

    /* reserveId 단위 환불 */
    @Transactional(rollbackFor = Exception.class)
    public void refundByReserveId(String reserveId, RsvType rsvType, String merchantId, String reason)
            throws Exception {

        log.info("💳 [Router] 부분 환불 분기 시작 - reserveId={}, type={}", reserveId, rsvType);

        if (rsvType != RsvType.FLY) {
            throw new UnsupportedOperationException("부분 환불은 항공(FLY) 결제만 지원됩니다.");
        }

        // 결제 마스터/상세 조회
        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다. merchantId=" + merchantId));

        // 항공 결제 서비스로 분기 (상태 갱신 포함)
        flyPaymentServiceImpl.handlePartialRefund(reserveId, merchantId, reason);

        log.info("✅ [Router] 부분 환불 완료 - reserveId={}, merchantId={}", reserveId, merchantId);
    }

    /* === 5. 환불 === */
    public void refundPayment(String merchantId, BigDecimal refundAmount, String reason)
            throws IamportResponseException, IOException {
        paymentService.refundPayment(merchantId, refundAmount, reason);
    }
}
