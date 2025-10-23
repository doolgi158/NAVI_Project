package com.navi.payment.service;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.request.RefundRequestDTO;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.repository.PaymentDetailRepository;
import com.navi.payment.repository.PaymentRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
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
    private final PaymentRouterService paymentRouterService;

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

    /* merchantId 단위 환불 */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refundPaymentByMerchantId(RefundRequestDTO dto)
            throws IamportResponseException, IOException, Exception {

        String merchantId = dto.getMerchantId();
        String reason = dto.getReason();

        log.info("💰 [ADMIN] 전체 환불 요청 - merchantId={}, reason={}", merchantId, reason);

        // PaymentRouter 통해 도메인별 환불 처리
        paymentRouterService.refundByMerchantId(merchantId, reason);
        log.info("✅ [ADMIN] 전체 환불 완료 - merchantId={}", merchantId);
    }

    /* reserveId 단위 환불 */
    @Transactional(rollbackFor = Exception.class)
    public void refundPaymentByReserveId(RefundRequestDTO dto)
            throws IamportResponseException, IOException, Exception {

        String reserveId = dto.getReserveId();
        String merchantId = dto.getMerchantId();
        String reason = dto.getReason();
        RsvType rsvType = dto.getRsvType();

        log.info("💸 [ADMIN] 부분 환불 요청 - reserveId={}, type={}, merchantId={}", reserveId, rsvType, merchantId);

        // FLY만 부분 환불 허용
        if (rsvType != RsvType.FLY) { throw new UnsupportedOperationException("부분 환불은 항공(FLY) 결제만 지원됩니다."); }

        paymentRouterService.refundByReserveId(reserveId, rsvType, merchantId, reason);
        log.info("✅ [ADMIN] 부분 환불 완료 - reserveId={}, type={}", reserveId, rsvType);
    }
}
