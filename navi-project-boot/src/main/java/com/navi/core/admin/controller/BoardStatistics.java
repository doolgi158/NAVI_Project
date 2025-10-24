package com.navi.core.admin.controller;

import lombok.Getter;
import lombok.Setter;

// 통계 DTO
@Setter
@Getter
public class BoardStatistics {
    private Long totalBoards;
    private Long todayBoards;
    private Long reportedBoards;

    public BoardStatistics(Long totalBoards, Long todayBoards, Long reportedBoards) {
        this.totalBoards = totalBoards;
        this.todayBoards = todayBoards;
        this.reportedBoards = reportedBoards;
    }

}
