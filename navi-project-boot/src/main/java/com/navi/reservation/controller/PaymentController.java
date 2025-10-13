package com.navi.reservation.controller;

import com.navi.reservation.dto.request.PaymentVerifyRequestDTO;
import com.navi.reservation.dto.response.PaymentVerifyResponseDTO;
import com.navi.reservation.service.PaymentService;
import com.navi.reservation.service.RsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final RsvService rsvService;

    /** ✅ 결제 검증 및 예약 확정 */
    @PostMapping("/verify")
    public PaymentVerifyResponseDTO verifyPayment(@RequestBody PaymentVerifyRequestDTO dto) throws Exception {
        log.info("[VERIFY] 결제 검증 요청: {}", dto);
        PaymentVerifyResponseDTO verified = paymentService.verifyPayment(dto);

        // 결제 성공 시 예약 확정 및 상세 등록
        if ("paid".equalsIgnoreCase(verified.getStatus())) {
            rsvService.confirmPaymentRsv(dto.getReserveId(), dto.getImpUid(), dto.getPayMethod());
        }
        return verified;
    }
}
