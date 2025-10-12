package com.navi.reservation.service;

import com.navi.reservation.domain.Rsv;
import com.navi.reservation.dto.request.PaymentVerifyRequestDTO;
import com.navi.reservation.dto.response.PaymentVerifyResponseDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;
import com.navi.reservation.repository.RsvRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final IamportClient iamportClient;  // 아임포트 서버랑 직접 통신하는 클라이언트
    private final RsvService rsvService;        // 예약 상태 업데이트 서비스
    private final RsvRepository rsvRepository;

    /* === 결제 검증 메서드 + 예약 상태 업데이트 === */
    public PaymentVerifyResponseDTO verifyPayment(PaymentVerifyRequestDTO dto)
        throws IamportResponseException, IOException {

        log.info("[PaymentService] 결제 검증 요청 - impUid: {}, merchantUid: {}",
                dto.getImpUid(), dto.getMerchantUid());

        // 1. PortOne 서버에서 결제 정보 조회
        // IamportResponse<Payment> : 아임포트 서버의 응답(결제 상세 데이터)을 담는 래퍼 클래스
        // paymentByImpUid(impUid) : impUid로 결제 정보 조회 - IamportClient의 주요 메서드
        //      ㄴ iamportClient가 REST API 호출을 대신 수행함 - GET /payments/{imp_uid}
        IamportResponse<Payment> response = iamportClient.paymentByImpUid(dto.getImpUid());

        if(response == null || response.getResponse() == null) {
            log.error("[PaymentService] PortOne 응답 없음 - impUid={}", dto.getImpUid());
            rsvService.cancelPayment(dto.getMerchantUid(), "결제 검증 실패: PortOne 응답 없음");
            throw new IllegalStateException("결제 검증 실패: 응답 데이터가 존재하지 않습니다.");
        }

        Payment payment = response.getResponse();
        log.info("결제 검증 완료 - 상태:{}, 금액:{}, 결제수단:{}, 주분번호:{}",
                payment.getStatus(), payment.getAmount(),
                payment.getPayMethod(), payment.getMerchantUid());

        // 2. DB내 예약 금액과 비교
        BigDecimal expectedAmount = rsvRepository.findTotalAmountByReserveId(dto.getMerchantUid());
        if (expectedAmount == null) {
            throw new IllegalStateException("결제 검증 실패: 예약 정보를 찾을 수 없습니다.");
        }

        BigDecimal paidAmount = payment.getAmount();        // PortOne 실제 결제 금액
        if (paidAmount.compareTo(expectedAmount) != 0) {
            log.error("[PaymentService] 결제 금액 불일치 - PortOne={}, DB={}", paidAmount, expectedAmount);
            rsvService.cancelPayment(dto.getMerchantUid(), "결제 금액 불일치 (위변조 가능성)");
            throw new IllegalStateException("결제 검증 실패: 결제 금액 불일치");
        }

        // 3. 결제 상태 분기 처리
        RsvResponseDTO rsvResponse;
        String status = payment.getStatus().toLowerCase();

        switch (status) {
            case "ready" -> {
                // 가상계좌 발급 (입금 대기 상태)
                rsvResponse = rsvService.updateReadyStatus(dto.getMerchantUid());
                log.info("[PaymentService] 가상계좌 발급 완료 - 입금 대기 reserveId={}", dto.getMerchantUid());
            }
            case "paid" -> {
                // 결제 성공 → 예약 확정
                rsvResponse = rsvService.confirmPaymentRsv(
                        dto.getMerchantUid(),
                        dto.getImpUid(),
                        payment.getPgProvider().toUpperCase()
                );
                log.info("[PaymentService] 결제 성공 → 예약 확정 완료 reserveId={}", dto.getMerchantUid());
            }
            case "failed", "cancelled" -> {
                // 결제 실패 or 사용자 취소
                rsvResponse = rsvService.cancelPayment(dto.getMerchantUid(), "결제 실패/취소 상태");
                log.warn("[PaymentService] 결제 실패/취소 처리 reserveId={}", dto.getMerchantUid());
            }
            default -> {
                // 기타 상태
                rsvService.failPayment(dto.getMerchantUid(), "알 수 없는 결제 상태: " + payment.getStatus());
                throw new IllegalStateException("결제 상태가 유효하지 않습니다: " + payment.getStatus());
            }
        }

        return PaymentVerifyResponseDTO.builder()
                .impUid(payment.getImpUid())
                .merchantUid(payment.getMerchantUid())
                .status(payment.getStatus())
                .amount(payment.getAmount().intValue())
                .pgProvider(payment.getPgProvider())
                .payMethod(payment.getPayMethod())
                .rsvResponse(rsvResponse)
                .message("결제 검증 및 예약 처리 완료")
                .build();
    }

    /* === 결제 취소 메서드 === */
    public PaymentVerifyResponseDTO cancelPaymentRequest(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {

        log.info("[PaymentService] 결제 취소 요청 - impUid={}, merchantUid={}",
                dto.getImpUid(), dto.getMerchantUid());

        // ✅ 1️⃣ CancelData 객체 생성
        // (impUid, 전액환불 여부, 환불 금액(선택))
        CancelData cancelData = new CancelData(dto.getImpUid(), true);

        // ✅ 2️⃣ 포트원 서버에 결제 취소 요청
        IamportResponse<Payment> cancelResponse = iamportClient.cancelPaymentByImpUid(cancelData);

        if (cancelResponse == null || cancelResponse.getResponse() == null) {
            throw new IllegalStateException("결제 취소 실패: 응답이 비어 있습니다.");
        }

        Payment payment = cancelResponse.getResponse();
        log.info("결제 취소 완료 - 상태:{}, 금액:{}, 결제수단:{}",
                payment.getStatus(), payment.getAmount(), payment.getPayMethod());

        // ✅ 3️⃣ DB 상태 변경
        RsvResponseDTO rsvResponse =
                rsvService.cancelPayment(dto.getMerchantUid(), "사용자 결제 취소 요청");

        // ✅ 4️⃣ 응답 반환
        return PaymentVerifyResponseDTO.builder()
                .impUid(payment.getImpUid())
                .merchantUid(payment.getMerchantUid())
                .status(payment.getStatus())
                .amount(payment.getAmount().intValue())
                .pgProvider(payment.getPgProvider())
                .payMethod(payment.getPayMethod())
                .rsvResponse(rsvResponse)
                .message("결제 취소 성공 및 DB 상태 동기화 완료")
                .build();
    }



}
