package com.navi.user.history.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class HistoryDTO {
    private long ID;                // 이력 ID

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String request;         // 탈퇴 요청일

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String withdrawDue;     // 탈퇴 예정일

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private String withdrawEnd;     //  탈퇴 처리일

    private String withdrawReason;  // 탈퇴 사유
}
