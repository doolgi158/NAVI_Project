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

    @Column(name = "board_title")
    private String boardTitle;

    @Column(name = "board_good")
    @Builder.Default
    private Integer boardGood = 0;

    @Column(name = "report_count")
    @Builder.Default
    private Integer reportCount = 0;

    @Column(name = "board_viewCount")
    @ColumnDefault("0")
    @Builder.Default
    private Integer boardViewCount = 0;

    @Lob
    @Column(name = "board_content")
    private String boardContent;

    @Column(name = "user_no")
    private Integer userNo;

    @CreationTimestamp
    @Column(name = "create_date")
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "board_image")
    private String boardImage;
}