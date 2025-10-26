package com.navi.admin.user.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class AdminDashboardDTO {
    // 유저 관련 통계
    private Users users;

    // 여행지/숙소 관련 (아직 미구현)
    private Travels travels;
    private Accommodations accommodations;

    // 결제 / 환불 / CS 관련 (미구현)
    private Payments payments;
    private Refunds refunds;

    // 차트용 데이터 (추세)
    private List<UserTrendDTO> userTrend;
    private List<UsageTrend> usageTrend;

    // -----------------------------
    // 내부 정적 클래스들
    // -----------------------------

    /**
     * 유저 통계
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Users {
        private long total;
        private long active;
        private long sleep;
        private long withdraw;
        private double changedPct;
    }

    /**
     * 여행지 관련
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Travels {
        private long count;          // 전체 등록된 여행지 수
        private long totalViews;     // 전체 조회수 합계
        private double changedPct;   // 전월 대비 증감률
    }

    /**
     * 숙소 관련
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Accommodations {
        private long count;
        private double changedPct;
    }

    /**
     * 결제 관련
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payments {
        private String month;          // 월 (예: 2025-10)
        private long paymentCount;     // 결제건수
        private long refundCount;      // 환불건수
        private BigDecimal salesAmount; // 매출금액
        private BigDecimal refundAmount; // 환불금액
        private double changedPct;
    }

    /**
     * 환불 관련
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Refunds {
        private double pct;
        private double changedPct;
    }

    /**
     * 이용량 트렌드 (조회/예약)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsageTrend {
        private String month;
        private long travelViews;
        private long accViews;
        private long flightResv;
    }

    /**
     * 항공편 관련
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Flights {
        private long count;          // 전체 등록 항공편 수
        private double changedPct;   // 전월 대비 증감률 (추후 사용)
    }
}
