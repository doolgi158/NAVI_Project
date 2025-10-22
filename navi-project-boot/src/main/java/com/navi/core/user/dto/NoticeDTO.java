package com.navi.core.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {
    private Integer noticeNo;
    private String noticeTitle;
    private String noticeFile;
    private String noticeContent;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private Integer noticeViewCount;
    private LocalDateTime noticeStartDate;
    private LocalDateTime noticeEndDate;
    private String noticeAttachFile;
}