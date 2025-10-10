//package com.navi.reservation.dto.request;
//
///*
// * ==============================
// * [RsvPreRequestDTO]
// * : 결제 전 예약 정보 입력 단계 DTO
// * ==============================
// * ㄴ 사용자가 결제창을 띄우기 전에 입력한 예약 데이터를 전달
// */
//
//import com.navi.reservation.domain.Rsv;
//import lombok.*;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class RsvPreRequestDTO {
//    private Long userNo;                        // 예약자 회원번호
//    private Rsv.TargetType targetType;          // 예약 유형
//    private String targetId;                    // 예약 대상 ID
//    private Rsv.PaymentMethod paymentMethod;    // 결제 수단
//    private Integer totalAmount;                // 결제 금액
//}
