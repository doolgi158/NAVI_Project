package com.navi.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {    //프론트엔드와 데이터를 주고받는 형식
                            //Entity를 직접 노출하지 않고 필요한 정보만 전달
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
