package com.navi.payment.controller;

import com.navi.common.response.ApiResponse;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentResultResponseDTO;
import com.navi.payment.service.PaymentRouterService;
import com.navi.payment.service.PaymentService;
import com.navi.security.util.JWTUtil;
import com.siot.IamportRestClient.exception.IamportResponseException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentUserController {
    private final PaymentRouterService paymentRouterService;
    private final JWTUtil jwtUtil;
    private final PaymentService paymentService;

    /* === [1. 결제 준비] === */
    @PostMapping("/prepare")
    public ResponseEntity<PaymentPrepareResponseDTO> preparePayment(@RequestBody PaymentPrepareRequestDTO dto) {
        log.info("✅ 결제 준비 요청 수신 - {}", dto);
        return ResponseEntity.ok(paymentRouterService.preparePayment(dto));
    }

    /* === [2. 결제 검증] === */
    @PostMapping("/verify")
    public ResponseEntity<PaymentResultResponseDTO> verifyPayment(@RequestBody PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {
        log.info("💳 [결제 검증 요청 수신] rsvType={}, merchantId={}, reserveIds={}",
                dto.getRsvType(), dto.getMerchantId(), dto.getReserveId());

        PaymentResultResponseDTO result = paymentRouterService.verifyAndCompletePayment(dto);

        log.info("✅ [결제 검증 완료] success={}, rsvStatus={}, merchantId={}",
                result.isSuccess(), result.getRsvStatus(), result.getMerchantId());

        return ResponseEntity.ok(result);
    }

    /* === [3. 결제 실패 처리] === */
    @PostMapping("/fail")
    public ResponseEntity<Void> failPayment(@RequestParam String merchantId,
                                            @RequestParam(required = false) String reason) {
        log.warn("❌ 결제 실패 처리 요청 - merchantId={}, reason={}", merchantId, reason);
        paymentRouterService.failPayment(merchantId, reason);
        return ResponseEntity.ok().build();
    }

    /* === [4. 환불 요청] === */
    @PostMapping("/refund")
    public ResponseEntity<Void> refundPayment(
            @RequestParam String merchantId,
            @RequestParam BigDecimal refundAmount,
            @RequestParam(required = false) String reason
    ) throws IamportResponseException, IOException {
        log.info("🔁 환불 요청 수신 - merchantId={}, amount={}, reason={}", merchantId, refundAmount, reason);
        paymentRouterService.refundPayment(merchantId, refundAmount, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ApiResponse<List<PaymentAdminListResponseDTO>> getMyPayments(HttpServletRequest request) {
        // 1헤더에서 토큰 추출
        String bearer = request.getHeader("Authorization");
        if (bearer == null || !bearer.startsWith("Bearer ")) {
            log.warn("🚫 Authorization 헤더가 비어 있음");
            return ApiResponse.error("인증 토큰이 없습니다.", 401, null);
        }

        String token = bearer.substring(7);

        // JWT에서 userId 추출
        String userId = jwtUtil.getUserIdFromToken(token);
        log.info("💳 [PaymentController] 결제 내역 요청 - userId: {}", userId);

        // 서비스 호출
        List<PaymentAdminListResponseDTO> payments = paymentService.getMyPayments(userId);

        return ApiResponse.success(payments);
    }
}
