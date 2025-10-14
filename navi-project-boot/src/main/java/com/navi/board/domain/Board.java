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
@Table(name = "board")
@Getter
@Setter
@ToString
@NoArgsConstructor
@SequenceGenerator(
        name = "boot_board_generator",
        sequenceName = "boot_board_seq",
        initialValue = 1,
        allocationSize = 1) //게시글번호를 시퀀스로 생성
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_no")
    private Integer board_no;   //게시글 번호

    @Column(name = "board_title", nullable = false, length = 30)
    private String board_title; //게시글 제목

    @Column(name = "board_good", nullable = false)
    private Integer board_good = 0; //좋아요

    @Column(name = "report_count")
    private Integer report_count = 0;  //신고

    @Lob
    @Column(name = "board_content", nullable = false)
    private String board_content;   //게시글내용

    @Column(nullable = false)
    private int user_no;    //사용자번호

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime create_date;  //등록

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime update_date;  //수정
}