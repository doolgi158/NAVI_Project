package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.common.enums.RsvType;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.dto.DeliveryReservationDTO;
import com.navi.delivery.service.DeliveryReservationService;
import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.payment.dto.request.*;
import com.navi.payment.dto.response.*;
import com.siot.IamportRestClient.exception.IamportResponseException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * ==============================================
 * [DlvPaymentService]
 * 짐배송 예약 + 결제 통합 트랜잭션 처리
 * ----------------------------------------------
 * ✅ /api/payment/delivery/prepare : 예약 생성 + 결제 준비
 * ✅ /api/payment/delivery/verify  : 결제 검증 + 확정(DB 반영)
 * ==============================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DlvPaymentService {

    private final DeliveryReservationService deliveryReservationService; // 예약 담당
    private final PaymentService paymentService; // 공통 결제 로직 (PaymentServiceImpl)

    /**
     * ✅ [1단계] 예약 + 결제 준비
     * PortOne 결제 직전 단계: 예약을 생성하고 결제 정보를 준비
     */
    @Transactional
    public PaymentPrepareResponseDTO preparePayment(DeliveryReservationDTO dto) {
        // 1️⃣ 예약 생성
        DeliveryReservation reservation = deliveryReservationService.createReservation(dto);
        String drsvId = reservation.getDrsvId();

        // 2️⃣ 결제 준비 요청
        PaymentPrepareRequestDTO paymentRequest = PaymentPrepareRequestDTO.builder()
                .totalAmount(reservation.getTotalPrice())
                .paymentMethod(PaymentMethod.KAKAOPAY) // 프론트에서 선택 가능 시 dto에서 받기
                .build();

        PaymentPrepareResponseDTO response = paymentService.preparePayment(paymentRequest);

        // 3️⃣ PaymentServiceImpl 내부에서 merchantId 생성되지만,
        // PortOne 요청 시에는 drsvId를 merchant_uid로 사용하므로 프론트는 drsvId를 그대로 사용
        log.info("✅ [짐배송 예약+결제 준비 완료] drsvId={}, totalAmount={}", drsvId, reservation.getTotalPrice());

        // ✅ prepare 응답에는 PortOne 결제용 ID로 drsvId를 반환
        return PaymentPrepareResponseDTO.builder()
                .merchantId(drsvId)
                .build();
    }

    /**
     * ✅ [2단계] 결제 검증 및 확정 처리
     * PortOne 검증 결과 기반으로 결제·예약 상태 반영
     */
    @Transactional
    public PaymentVerifyResponseDTO verifyAndCompletePayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {

        String drsvId = dto.getMerchantId(); // PortOne의 merchant_uid == drsvId

        // 1️⃣ PortOne 결제 검증
        PaymentVerifyResponseDTO verifyResult = paymentService.verifyPayment(dto);

        if (!verifyResult.isSuccess()) {
            // 결제 실패 처리
            log.warn("❌ [짐배송 결제 검증 실패] drsvId={}, reason={}", drsvId, verifyResult.getMessage());
            paymentService.failPayment(drsvId, verifyResult.getMessage());
            deliveryReservationService.updateStatus(drsvId, RsvStatus.FAILED.name());
            return verifyResult;
        }

        // 2️⃣ 결제 검증 성공 → 결제 확정
        PaymentConfirmRequestDTO confirmRequest = PaymentConfirmRequestDTO.builder()
                .merchantId(drsvId)
                .reserveType(RsvType.DLV)
                .impUid(dto.getImpUid())
                .paymentMethod(PaymentMethod.KAKAOPAY)
                .items(List.of(
                        PaymentConfirmRequestDTO.ReservePaymentItem.builder()
                                .reserveId(drsvId)
                                .amount(dto.getTotalAmount())
                                .build()
                ))
                .build();

        PaymentConfirmResponseDTO confirmResult = paymentService.confirmPayment(confirmRequest);

        // 3️⃣ 예약 상태 갱신
        deliveryReservationService.updateStatus(drsvId, RsvStatus.PAID.name());
        log.info("💰 [짐배송 결제 완료] drsvId={} → PAID", drsvId);

        // 4️⃣ 프론트 반환 DTO
        return PaymentVerifyResponseDTO.builder()
                .success(true)
                .message("결제 및 예약 확정 완료")
                .impUid(dto.getImpUid())
                .merchantId(drsvId)
                .build();
    }
}
