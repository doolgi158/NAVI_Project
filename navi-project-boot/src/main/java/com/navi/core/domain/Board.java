package com.navi.core.domain;

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
    private Integer boardNo;

    @Column(name = "board_title", nullable = false)
    private String boardTitle;

    @Column(name = "board_good")
    @Builder.Default
    private Integer boardGood = 0;

    @Column(name = "report_count")
    @Builder.Default
    private Integer reportCount = 0;

    @Column(name = "board_view_count")
    @Builder.Default
    private Integer boardViewCount = 0;

    @Lob
    @Column(name = "board_content", nullable = false)
    private String boardContent;

    /**
     * 작성자 번호 (NAVI_USER 테이블의 user_no 참조)
     * 로그인한 사용자의 번호가 저장됨
     */
    @Column(name = "user_no", nullable = false)
    private Integer userNo;

    @CreationTimestamp
    @Column(name = "create_date", updatable = false)
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    /**
     * 이미지 URL (Image 테이블과 연동)
     * targetType="BOARD", targetId=boardNo로 조회
     */
    @Column(name = "board_image")
    private String boardImage;

    /**
     * 게시글 작성자 확인
     */
    public boolean isAuthor(Integer currentUserNo) {
        return this.userNo.equals(currentUserNo);
    }
}