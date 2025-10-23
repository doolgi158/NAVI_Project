import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

/**
 * X축 라벨용 포맷 함수
 */
export const formatTickLabel = (v, range) => {
    if (!v) return "";

    if (range === "daily") {
        const [_, m, d] = v.split("-");
        return `${Number(m)}월 ${Number(d)}일`;
    }

    if (range === "weekly") {
        const [year, m, weekRaw] = v.split("-");
        if (!weekRaw) return `${Number(m)}월`;
        const weekNum = typeof weekRaw === "string" ? weekRaw.replace("W", "") : "";
        return `${Number(m)}월 ${Number(weekNum)}주`;
    }

    if (range === "monthly") {
        const [_, m] = v.split("-");
        return `${Number(m)}월`;
    }

    return v;
};

/**
 * 최근 기간 목록을 생성 (daily, weekly, monthly)
 */
export const generatePeriods = (range) => {
    const now = dayjs();
    const periods = [];

    if (range === "daily") {
        // 최근 1개월간 날짜별
        const start = now.subtract(1, "month").startOf("day");
        for (let d = start; d.isBefore(now.add(1, "day")); d = d.add(1, "day")) {
            periods.push(d.format("YYYY-MM-DD"));
        }
    }

    else if (range === "weekly") {
        // 최근 4개월간 주차별
        const start = now.subtract(4, "month").startOf("week");
        const end = now.endOf("week");

        for (let w = start; w.isBefore(end); w = w.add(1, "week")) {
            const month = w.month() + 1;
            const weekNum = w.isoWeek() - dayjs(`${w.year()}-01-01`).isoWeek() + 1;
            periods.push(`${w.year()}-${String(month).padStart(2, "0")}-W${weekNum}`);
        }
    }

    else {
        // 최근 6개월간 월별
        const start = now.subtract(6, "month").startOf("month");
        for (let m = start; m.isBefore(now.add(1, "month")); m = m.add(1, "month")) {
            periods.push(m.format("YYYY-MM"));
        }
    }

    return periods;
};