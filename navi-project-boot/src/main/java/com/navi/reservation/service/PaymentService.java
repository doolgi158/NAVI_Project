package com.navi.reservation.service;

import com.navi.reservation.dto.request.PaymentVerifyRequestDTO;
import com.navi.reservation.dto.response.PaymentVerifyResponseDTO;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    // 아임포트 서버랑 직접 통신하는 클라이언트
    private final IamportClient iamportClient;

    /** === 결제 검증 메서드 (PortOne 서버 통신) === */
    public PaymentVerifyResponseDTO verifyPayment(PaymentVerifyRequestDTO dto)
        throws IamportResponseException, IOException {

        log.info("[PaymentService] 결제 검증 요청 - impUid: {}, merchantUid: {}",
                dto.getImpUid(), dto.getMerchantUid());


        // 아임포트 서버에서 결제 정보 조회
        // IamportResponse<Payment> : 아임포트 서버의 응답(결제 상세 데이터)을 담는 래퍼 클래스
        // paymentByImpUid(impUid) : impUid로 결제 정보 조회(IamportClient의 주요 메서드)
        // ㄴ REST API 호출 대신 수행 - GET /payments/{imp_uid}
        IamportResponse<Payment> response = iamportClient.paymentByImpUid(dto.getImpUid());

        if(response == null || response.getResponse() == null) {
            throw new IllegalArgumentException("결제 검증 실패: 응답 데이터가 존재 하지 않습니다.");
        }

        //결제 상태 로그 출력
        Payment payment = response.getResponse();
        log.info("결제 검증 완료 - 상태:{}, 금액:{}, 결제수단:{}, 주분번호:{}",
                payment.getStatus(), payment.getAmount(),
                payment.getPayMethod(), payment.getMerchantUid());

        return PaymentVerifyResponseDTO.builder()
                .impUid(payment.getImpUid())
                .merchantUid(payment.getMerchantUid())
                .status(payment.getStatus())
                .amount(payment.getAmount().intValue())
                .payMethod(payment.getPayMethod())
                .pgProvider(payment.getPgProvider())
                .message("결제 검증 성공")
                .build();
    }


}
