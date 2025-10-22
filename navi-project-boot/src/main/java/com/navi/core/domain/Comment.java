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

    @Column(name = "comment_content", nullable = false)
    private String commentContent;

    @Column(name = "board_no", nullable = false)
    private Integer boardNo;

    /**
     * 작성자 번호 (NAVI_USER 테이블의 user_no 참조)
     */
    @Column(name = "user_no", nullable = false)
    private Integer userNo;

    @CreationTimestamp
    @Column(name = "create_date")
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    /**
     * 부모 댓글 번호 (대댓글인 경우)
     */
    @Column(name = "parent_comment")
    private Integer parentComment;

    /**
     * 댓글 깊이 (0: 일반 댓글, 1: 대댓글)
     */
    @Column(name = "comment_depth")
    @Builder.Default
    private Integer commentDepth = 0;

    /**
     * 신고 횟수
     */
    @Column(name = "report_count")
    @Builder.Default
    private Integer reportCount = 0;

    /**
     * 댓글 작성자 확인
     */
    public boolean isAuthor(Integer currentUserNo) {
        return this.userNo.equals(currentUserNo);
    }

    /**
     * 일반 댓글인지 확인
     */
    public boolean isParentComment() {
        return this.parentComment == null;
    }

    /**
     * 대댓글인지 확인
     */
    public boolean isReply() {
        return this.parentComment != null;
    }
}