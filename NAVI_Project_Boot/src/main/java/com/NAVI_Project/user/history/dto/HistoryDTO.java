package com.NAVI_Project.user.history.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "navi_history")
@SequenceGenerator(
        name = "navi_history_generator",
        sequenceName = "navi_history_seq",
        initialValue = 1,
        allocationSize = 1
)
public class HistoryDTO {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_history_generator")
    @Column(name = "history_id")
    private long ID;                // 이력 ID

    @Column(name = "history_request", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String request;         // 탈퇴 요청일

    @Column(name = "history_withdrawdue")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String withdrawDue;     // 탈퇴 예정일

    @Column(name = "history_withdrawend", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String withdrawEnd;     //  탈퇴 처리일

    @Column(name = "history_withdrawreason")
    private String withdrawReason;  // 탈퇴 사유
}
