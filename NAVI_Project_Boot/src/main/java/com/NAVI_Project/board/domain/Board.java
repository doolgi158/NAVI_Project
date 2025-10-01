package com.NAVI_Project.board.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@SequenceGenerator(
        name = "boot_board_generator",
        sequenceName = "boot_board_seq",
        initialValue = 1,
        allocationSize = 1) //게시글번호를 시퀀스로 생성
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "boot_board_generator")
    @Column(nullable = false, length = 10)
    private int board_no;   //게시글번호

    @Column(nullable = false, length = 10)
    private String board_Title; //게시글제목

    @Column(nullable = false, length = 99)
    private int board_good;  //좋아요수

    @Column(nullable = true, length = 10)
    private int report_count;   //신고수

    @Lob
    @Column(nullable = false, length = 500)
    private String board_content;   //게시글내용

}