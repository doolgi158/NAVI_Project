package com.navi.notice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
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

    //게시글번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_no")
    private Integer noticeNo;

    //제목
    @Column(name = "notice_title", length = 200, nullable = false)
    private String noticeTitle;

    @Column(name = "notice_file", length = 200)
    private String noticeFile;

    //내용
    @Lob
    @Column(name = "notice_content", columnDefinition = "CLOB")
    private String noticeContent;

    //등록일
    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;

    //수정일
    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    //조회수
    @Column(name = "notice_viewCount", nullable = false)
    @ColumnDefault("0")
    private Integer noticeViewCount = 0;

    //시작일
    @Column(name = "notice_startDate")
    private LocalDateTime noticeStartDate;

    //종료일
    @Column(name = "notice_endDate")
    private LocalDateTime noticeEndDate;

    //파일업로드
    @Column(name = "notice_attachFile", length = 500)
    private String noticeAttachFile;
}