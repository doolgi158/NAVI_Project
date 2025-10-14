package com.navi.board.domain;

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
    private Integer commentNo; // 댓글 번호

    @Column(name = "comment_content", nullable = false, length = 100)
    private String commentContent; // 댓글 내용

    @Column(name = "board_no", nullable = false)
    private Integer boardNo;  // 게시글 번호

    @Column(name = "user_no", nullable = false)
    private Integer userNo;  // 작성자 번호

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;   // 등록일 (자동 설정됨)

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;   // 수정일 (자동 설정됨)

    @Column(name = "parent_comment")
    private Integer parentComment;  // 대댓글용 (부모 댓글 번호)
}