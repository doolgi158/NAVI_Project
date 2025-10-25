package com.navi.payment.controller;

import com.navi.common.response.ApiResponse;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.service.PaymentAdminService;
import com.navi.payment.service.PaymentService;
import com.navi.security.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm/payment")
public class PaymentAdminController {
    private final PaymentAdminService paymentAdminService;
    private final PaymentService paymentService;
    private final JWTUtil jwtUtil;

    @GetMapping("/list")
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

    @GetMapping("/details/{merchantId}")
    public ResponseEntity<List<PaymentAdminDetailResponseDTO>> getPaymentDetails(
            @PathVariable String merchantId
    ) {
        log.info("🔍 [ADMIN API] 단일 결제 상세 조회 요청 - merchantId={}", merchantId);

        List<PaymentAdminDetailResponseDTO> details =
                paymentAdminService.getPaymentDetailsForAdmin(merchantId);

        return ResponseEntity.ok(details);
    }

    @PostMapping("/refund/detail")
    public ResponseEntity<PaymentAdminListResponseDTO> refundByMerchantId(
            @RequestParam String merchantId,
            @RequestParam(defaultValue = "관리자 전체 환불") String reason
    ) throws Exception {
        log.info("💰 [ADMIN API] 전체 환불 요청 - merchantId={}, reason={}", merchantId, reason);

        PaymentAdminListResponseDTO refunded =
                paymentAdminService.refundPaymentByMerchantId(merchantId, reason);

        return ResponseEntity.ok(refunded);
    }
}
