//package com.navi.user.domain;
//
//import jakarta.persistence.*;
//import lombok.*;
//
//@Getter
//@Builder
//@AllArgsConstructor
//@NoArgsConstructor
//@Entity
//@Table(name = "navi_history")
//@SequenceGenerator(
//        name = "navi_history_generator",
//        sequenceName = "navi_history_seq",
//        initialValue = 1,
//        allocationSize = 1
//)
//public class History {
//    @Id
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_history_generator")
//    @Column(name = "history_id")
//    private long ID;                // 이력 ID
//
//    @Column(name = "history_request", nullable = false)
//    private String request;         // 탈퇴 요청일
//
//    @Column(name = "history_withdrawdue")
//    private String withdrawDue;     // 탈퇴 예정일
//
//    @Column(name = "history_withdrawend", updatable = false)
//    private String withdrawEnd;     //  탈퇴 처리일
//
//    @Column(name = "history_withdrawreason")
//    private String withdrawReason;  // 탈퇴 사유
//}
