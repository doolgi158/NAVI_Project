<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/user/domain/History.java
package com.navi.user.domain;
========
package com.navi.user.history.dto;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/user/history/dto/HistoryDTO.java

import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "navi_history")
@SequenceGenerator(
        name = "navi_history_generator",
        sequenceName = "navi_history_seq",
        initialValue = 1,
        allocationSize = 1
)
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_history_generator")
    @Column(name = "history_id")
    private long ID;                // 이력 ID

    @Column(name = "history_request", nullable = false)
    private String request;         // 탈퇴 요청일

    @Column(name = "history_withdrawdue")
    private String withdrawDue;     // 탈퇴 예정일

    @Column(name = "history_withdrawend", updatable = false)
    private String withdrawEnd;     //  탈퇴 처리일

    @Column(name = "history_withdrawreason")
    private String withdrawReason;  // 탈퇴 사유
}
