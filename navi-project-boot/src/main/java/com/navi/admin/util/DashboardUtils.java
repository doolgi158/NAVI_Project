package com.navi.admin.util;

public class DashboardUtils {
    private DashboardUtils() {
    }

    // 증감률 계산 (소수점 1자리 반올림)
    public static double calcPctChange(double curr, double prev) {
        if (prev == 0) return 0.0;
        return Math.round(((curr - prev) / prev) * 1000.0) / 10.0;
    }

    public static double calcPctChange(long curr, long prev) {
        if (prev == 0) return 0.0;
        return Math.round(((double) (curr - prev) / prev) * 1000.0) / 10.0;
    }
}
