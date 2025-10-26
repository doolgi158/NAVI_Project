package com.navi.core.domain;

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

    //공지번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_no")
    private Integer noticeNo;

    //공지제목
    @Column(name = "notice_title")
    private String noticeTitle;

    //파일
    @Column(name = "notice_file")
    private String noticeFile;

    //공지내용
    @Lob
    @Column(name = "notice_content")
    private String noticeContent;

    //등록일
    @CreationTimestamp
    @Column(name = "create_date")
    private LocalDateTime createDate;

    //수정일
    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    //조회수
    @Column(name = "notice_viewCount")
    @ColumnDefault("0")
    private Integer noticeViewCount = 0;

    //시작일
    @Column(name = "notice_startDate")
    private LocalDateTime noticeStartDate;

    //종료일
    @Column(name = "notice_endDate")
    private LocalDateTime noticeEndDate;


}