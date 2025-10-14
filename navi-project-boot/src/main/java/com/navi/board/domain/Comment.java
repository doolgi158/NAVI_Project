package com.navi.board.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_seq")
    @SequenceGenerator(name = "comment_seq", sequenceName = "NAVI_COMMENT_SEQ", allocationSize = 1)
    @Column(name = "COMMENT_NO")
    private Integer commentNo; //댓글번호

    @Column(name = "COMMENT_CONTENT", nullable = false, length = 100)
    private String commentContent; //댓글내용

    @Column(name = "BOARD_NO", nullable = false)
    private Integer boardNo;  // 게시글 번호

    @Column(name = "USER_NO", nullable = false)
    private Integer userNo;  // 작성자 번호

    @Column(name = "CREATE_DATE", nullable = false, updatable = false)
    private LocalDateTime createDate;   //등록

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;   //수정

    @Column(name = "PARENT_COMMENT")
    private Integer parentComment;  // 대댓글용
}