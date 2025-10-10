package com.navi.reservation.controller;

import com.navi.reservation.dto.request.PaymentVerifyRequestDTO;
import com.navi.reservation.dto.response.PaymentVerifyResponseDTO;
import com.navi.reservation.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    /** 결제 검증 요청 (프론트 → 백) */
    @PostMapping("/verify")
    public PaymentVerifyResponseDTO verifyPayment(@RequestBody PaymentVerifyRequestDTO dto) throws Exception {
        log.info("[VERIFY] 결제 검증 요청: {}", dto);
        return paymentService.verifyPayment(dto);
    }
}
