package com.navi.reservation.controller;

import com.navi.accommodation.dto.request.AccRsvRequestDTO;
import com.navi.accommodation.service.AccRsvService;
import com.navi.reservation.domain.enums.RsvType;
import com.navi.reservation.dto.request.PaymentVerifyRequestDTO;
import com.navi.reservation.dto.response.PaymentVerifyResponseDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;
import com.navi.reservation.service.PaymentService;
import com.navi.reservation.service.RsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {
    private final RsvService rsvService;
    private final PaymentService paymentService;

    /* 상세예약 서비스 (숙소 / 항공 / 배송) */
    private final AccRsvService accRsvService;
    // Todo: private final AirRsvService flyRsvService;
    // Todo: private final DlvRsvService dlvRsvService;

    /* 결제 검증 및 예약 확정 */
    @PostMapping("/verify")
    public PaymentVerifyResponseDTO verifyPayment(@RequestBody PaymentVerifyRequestDTO dto) throws Exception {

        log.info("[PaymentController] 결제 검증 요청 - reserveId={}, impUid={}", dto.getReserveId(), dto.getImpUid());

        // 포트원 결제 검증 (+ 예약 상태 업데이트)
        PaymentVerifyResponseDTO verified = paymentService.verifyPayment(dto);

        // 결제 성공 시 예약 확정
        if ("paid".equalsIgnoreCase(verified.getStatus())) {
            rsvService.confirmPaymentRsv(dto.getReserveId(), dto.getImpUid(), dto.getPayMethod());
        } else {
            log.warn("[PaymentController] 결제 실패 또는 미완료 상태 → status={}", verified.getStatus());
        }

        return verified;
    }

    /* === 결제 취소 요청 === */
    @PostMapping("/cancel")
    public ResponseEntity<PaymentVerifyResponseDTO> cancelPayment(@RequestBody PaymentVerifyRequestDTO dto) throws Exception {
        log.info("[PaymentController] 결제 취소 요청: {}", dto);
        PaymentVerifyResponseDTO response = paymentService.cancelPaymentRequest(dto);
        return ResponseEntity.ok(response);
    }

}
