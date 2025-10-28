package com.navi.core.user.dto;

import com.navi.core.domain.Board;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BoardDTO {
    private Integer userNo;       // 사용자 번호
    private Integer boardNo;      // 게시글 번호
    private String boardTitle;    // 게시글 제목
    private String boardContent;  // 게시글 내용
    private String boardImage;    // 게시글 이미지 (URL 또는 파일명)
    private LocalDateTime createDate;
    private String modDate;       // 수정일
    private int boardGood;        // 좋아요 수
    private int boardReport;      // 신고 수
    private Long boardViewCount;       // 조회 수
    private Integer commentNo;    // 댓글 번호
    private Integer commentCount;

    public static BoardDTO from(Board entity) {
        return BoardDTO.builder()
                .userNo(entity.getUserNo())
                .boardNo(entity.getBoardNo())
                .boardTitle(entity.getBoardTitle())
                .boardContent(entity.getBoardContent())
                .boardImage(entity.getBoardImage())
                .createDate(entity.getCreateDate() != null ? LocalDateTime.parse(entity.getCreateDate().toString()) : null)
                .modDate(entity.getUpdateDate() != null ? entity.getUpdateDate().toString() : null)
                .boardGood(entity.getBoardGood())
                .boardReport(entity.getReportCount())
                .boardViewCount(entity.getBoardViewCount().longValue())
                .build();
    }

}