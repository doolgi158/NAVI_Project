package com.navi.core.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "board_comment")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_seq")
    @SequenceGenerator(name = "comment_seq", sequenceName = "NAVI_COMMENT_SEQ", allocationSize = 1)
    @Column(name = "comment_no")
    private Integer commentNo;

    @Column(name = "comment_content")
    private String commentContent;

    @Column(name = "board_no")
    private Integer boardNo;

    @Column(name = "user_no")
    private Integer userNo;

    @CreationTimestamp
    @Column(name = "create_date")
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "parent_comment")
    private Integer parentComment;

    @Column(name = "comment_depth")
    private Integer commentDepth;

    @Column(name = "report_count")
    private Integer reportCount;
}