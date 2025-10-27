package com.navi.payment.service;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.repository.PaymentDetailRepository;
import com.navi.payment.repository.PaymentRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentAdminServiceImpl implements PaymentAdminService {
    private final IamportClient iamportClient;
    private final PaymentRepository paymentRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final PaymentServiceImpl paymentService;

    /* 결제 전체 조회 - 필터링 */
    @Override
    public List<PaymentAdminListResponseDTO> getAllPaymentsForAdmin
        (RsvType rsvType, PaymentStatus paymentStatus, String keyword) {
        log.info("🔍 [ADMIN] 결제내역 조회 요청 - rsvType={}, paymentStatus={}, keyword={}", rsvType, paymentStatus, keyword);

        List<PaymentMaster> resultList;

        boolean hasType = (rsvType != null);
        boolean hasStatus = (paymentStatus != null);
        boolean hasKeyword = (keyword != null && !keyword.isBlank());

        if (hasKeyword) {
            // 키워드 검색 (merchantId 또는 reserveId)
            Optional<PaymentMaster> byMerchantId = paymentRepository.findOneByMerchantId(keyword);
            if (byMerchantId.isPresent()) {
                resultList = List.of(byMerchantId.get());
            } else {
                List<PaymentDetail> foundDetails = paymentDetailRepository.findAdminDetailsByReserveId(keyword);

                if (!foundDetails.isEmpty()) {
                    resultList = foundDetails.stream()
                            .map(PaymentDetail::getPaymentMaster)
                            .distinct()
                            .toList();
                } else {
                    resultList = Collections.emptyList();
                }
            }
        } else if (hasType) {
            resultList = paymentRepository.findAllMastersByRsvType(rsvType);
        } else if (hasStatus) {
            resultList = paymentRepository.findAllMastersByStatus(paymentStatus);
        } else {
            resultList = paymentRepository.findAllMasters();
        }

        // DTO 변환
        return resultList.stream()
                .map(PaymentAdminListResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /* 단일 결제 상세 조회 */
    @Override
    public List<PaymentAdminDetailResponseDTO> getPaymentDetailsForAdmin(String merchantId) {
        log.info("🔍 [ADMIN] 단일 결제 상세 조회 요청 - merchantId={}", merchantId);

        // 해당 결제의 상세 항목 전체 조회
        List<PaymentDetail> details = paymentDetailRepository.findAdminDetailsByMerchantId(merchantId);

        if (details.isEmpty()) {
            throw new IllegalArgumentException("해당 결제의 상세 내역이 존재하지 않습니다. merchantId=" + merchantId);
        }

        return details.stream()
                .map(PaymentAdminDetailResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /* reserveId 단위 환불 */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentAdminDetailResponseDTO refundPaymentDetail(String reserveId, String reason)
            throws IamportResponseException, IOException {

        log.info("💸 [ADMIN] 부분 환불 요청 - reserveId={}, reason={}", reserveId, reason);

        List<PaymentDetail> details = paymentDetailRepository.findAdminDetailsByReserveId(reserveId);
        if (details.isEmpty()) {
            throw new IllegalArgumentException("해당 예약 ID에 대한 결제 상세 내역이 존재하지 않습니다.");
        }

        PaymentDetail detail = details.get(0);
        PaymentMaster master = detail.getPaymentMaster();
        RsvType type = detail.getRsvType();

        // PG 서버 환불 요청
        IamportResponse<Payment> cancelResponse = iamportClient.cancelPaymentByImpUid(
                new CancelData(master.getImpUid(), false, detail.getAmount())
        );

        if (cancelResponse == null || cancelResponse.getResponse() == null) {
            throw new IllegalStateException("PG 환불 실패 (impUid=" + master.getImpUid() + ")");
        }

        // 상세 상태 변경
        detail.markAsRefunded(reason);

        // 예약 유형별 처리 분기
        switch (type) {
            case ACC, DLV -> {
                // 숙소나 짐배송은 reserveId 단위 = 전체 환불
                master.markAsRefunded(detail.getAmount());
                paymentRepository.save(master);
                log.info("🏠 [ADMIN] 숙소/배송 전체 환불 처리 - merchantId={}, reserveId={}",
                        master.getMerchantId(), reserveId);
            }
            case FLY -> {
                // 항공편 환불은 부분 또는 전체 환불로 구분
                boolean allRefunded = master.getPaymentDetails().stream()
                        .allMatch(d -> d.getPaymentStatus() == PaymentStatus.REFUNDED);

                if (allRefunded) {
                    master.markAsRefunded(master.getTotalAmount());
                    log.info("✈️ [ADMIN] 항공 전체 환불 완료 - merchantId={}, reserveId={}",
                            master.getMerchantId(), reserveId);
                } else {
                    master.markAsPartialRefunded(detail.getAmount());
                    log.info("✈️ [ADMIN] 항공 부분 환불 처리 - merchantId={}, reserveId={}",
                            master.getMerchantId(), reserveId);
                }
                paymentRepository.save(master);
            }
            default -> throw new IllegalStateException("지원되지 않는 예약 유형입니다: " + type);
        }

        log.info("✅ [ADMIN] 환불 완료 - merchantId={}, reserveId={}, type={}",
                master.getMerchantId(), reserveId, type);

        return PaymentAdminDetailResponseDTO.fromEntity(detail);
    }


    /* merchantId 단위 환불 */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentAdminListResponseDTO refundPaymentByMerchantId(String merchantId, String reason)
            throws IamportResponseException, IOException {

        log.info("💸 [ADMIN] 전체 환불 요청 - merchantId={}, reason={}", merchantId, reason);

        // 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        // PortOne(아임포트) 환불 수행 (공통 로직)
        paymentService.refundPayment(merchantId, master.getTotalAmount(), reason);

        // 환불 후 다시 조회 (상태 최신화)
        PaymentMaster updated = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("갱신된 결제 정보를 찾을 수 없습니다."));

        return PaymentAdminListResponseDTO.fromEntity(updated);
    }
}
