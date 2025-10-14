package com.navi.board.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_no")
    private Integer comment_no; //댓글번호

    @Column(name = "comment_content", nullable = false, length = 100)
    private String comment_content; //댓글내용

    @Column(name = "board_no", nullable = false)
    private Integer board_no;  // 게시글 번호

    @Column(name = "user_no", nullable = false)
    private Integer user_no;  // 작성자 번호

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime create_date;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime update_date;

    @Column(name = "parent_comment")
    private Integer parent_comment;  // 대댓글용
}