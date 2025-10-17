package com.navi.notice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "notice")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_no")
    private Integer noticeNo;

    @Column(name = "notice_title", length = 200, nullable = false)
    private String noticeTitle;

    @Column(name = "notice_file", length = 200)
    private String noticeFile;

    @Lob
    @Column(name = "notice_content", columnDefinition = "CLOB")
    private String noticeContent;

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "notice_viewCount")
    private Integer noticeViewCount = 0;

    @Column(name = "notice_startDate")
    private LocalDateTime noticeStartDate;

    @Column(name = "notice_endDate")
    private LocalDateTime noticeEndDate;

    @Column(name = "notice_attachFile", length = 500)
    private String noticeAttachFile;
}