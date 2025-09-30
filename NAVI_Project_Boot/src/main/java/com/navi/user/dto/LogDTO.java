package com.navi.user.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogDTO {
    private long ID;        // 로그 아이디
    private int payment;    // 결제 횟수
    private int refund;     // 환불 요청 수
    private int schedule;   // 계획 작성 수
    private int delivery;   // 배송 요청 수
    private int board;      // 게시글 작숭 수
    private int comment;    // 잿글 작성 수
}
