package com.navi.board.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "board")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SequenceGenerator(
        name = "boot_board_generator",
        sequenceName = "boot_board_seq",
        initialValue = 1,
        allocationSize = 1
)
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "boot_board_generator")
    @Column(name = "board_no")
    private Integer boardNo;   // 게시글 번호 (카멜케이스)

    @Column(name = "board_title", nullable = false, length = 30)
    private String boardTitle; // 게시글 제목

    @Column(name = "board_good", nullable = false)
    @Builder.Default
    private Integer boardGood = 0; // 좋아요

    @Column(name = "report_count")
    @Builder.Default
    private Integer reportCount = 0;  // 신고

    // 조회수
    @Column(name = "board_view_count")
    @ColumnDefault("0")
    @Builder.Default
    private Integer boardViewCount = 0;

    @Lob
    @Column(name = "board_content", nullable = false)
    private String boardContent;   // 게시글 내용

    @Column(name = "user_no", nullable = false)
    private Integer userNo;    // 사용자 번호

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;  // 등록일 (자동 설정됨)

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;  // 수정일 (자동 설정됨)

    @Column(name = "board_image", length = 500)
    private String boardImage;  //이미지
}