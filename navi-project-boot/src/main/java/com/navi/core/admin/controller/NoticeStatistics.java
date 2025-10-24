package com.navi.core.admin.controller;

import lombok.Getter;
import lombok.Setter;

// 통계 DTO
@Setter
@Getter
public class NoticeStatistics {
    private Long totalNotices;
    private Long activeNotices;  // 현재 게시 중인 공지
    private Long todayNotices;

    public NoticeStatistics(Long totalNotices, Long activeNotices, Long todayNotices) {
        this.totalNotices = totalNotices;
        this.activeNotices = activeNotices;
        this.todayNotices = todayNotices;
    }

}
