package com.navi.core.dto;

import com.navi.core.domain.Notice;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {
    private Integer noticeNo;
    private String noticeTitle;
    private String noticeContent;
    private String noticeImage;
    private String noticeAttachFile;
    private LocalDateTime noticeStartDate;
    private LocalDateTime noticeEndDate;
    private Integer noticeViewCount;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;

    /**
     * Entity -> DTO 변환
     */
    public static NoticeDTO fromEntity(Notice notice) {
        if (notice == null) {
            return null;
        }

        return NoticeDTO.builder()
                .noticeNo(notice.getNoticeNo())
                .noticeTitle(notice.getNoticeTitle())
                .noticeContent(notice.getNoticeContent())
                .noticeImage(notice.getNoticeImage())
                .noticeAttachFile(notice.getNoticeFile())
                .noticeStartDate(notice.getNoticeStartDate())
                .noticeEndDate(notice.getNoticeEndDate())
                .noticeViewCount(notice.getNoticeViewCount())
                .createDate(notice.getCreateDate())
                .updateDate(notice.getUpdateDate())
                .build();
    }

    /**
     * DTO -> Entity 변환
     */
    public Notice toEntity() {
        return Notice.builder()
                .noticeNo(this.noticeNo)
                .noticeTitle(this.noticeTitle)
                .noticeContent(this.noticeContent)
                .noticeImage(this.noticeImage)
                .noticeFile(this.noticeAttachFile)
                .noticeStartDate(this.noticeStartDate)
                .noticeEndDate(this.noticeEndDate)
                .noticeViewCount(this.noticeViewCount)
                .build();
    }
}