export const COLORS = ["#3b82f6", "#22c55e", "#a78bfa", "#f59e0b", "#ef4444", "#14b8a6"];

export const MOCK_SUMMARY = {
    users: { total: 12430, new: 320, active: 9450, changedPct: +8.2 },
    travels: { count: 540, changedPct: +3.1 },
    accommodations: { count: 1280, changedPct: +5.7 },
    payments: { amount: 42150000, count: 1680, changedPct: +12.0 },
    refunds: { amount: 890000, pct: 2.1, changedPct: -0.4 },
    flights: { bookings: 320, changedPct: +9.0 },
    cs: { pending: 5, handleRate: 98 },
    security: { loginFailed: 12, blockedIp: 3 },
    engagement: { likes: 13800, bookmarks: 9200, plans: 4200 },
};

export const MOCK_TREND_MONTHLY = {
    userTrend: [
        { name: "1월", join: 820, leave: 120, active: 8200 },
        { name: "2월", join: 920, leave: 140, active: 8650 },
        { name: "3월", join: 880, leave: 160, active: 8900 },
        { name: "4월", join: 1020, leave: 150, active: 9300 },
        { name: "5월", join: 1100, leave: 170, active: 9450 },
    ],
    salesTrend: [
        { name: "1월", sales: 12000000, refunds: 500000, count: 380 },
        { name: "2월", sales: 18000000, refunds: 600000, count: 420 },
        { name: "3월", sales: 16500000, refunds: 520000, count: 410 },
        { name: "4월", sales: 21000000, refunds: 740000, count: 450 },
        { name: "5월", sales: 24000000, refunds: 820000, count: 480 },
    ],
    usageTrend: [
        { name: "1월", travelViews: 32000, accViews: 21000, flightResv: 1200 },
        { name: "2월", travelViews: 36000, accViews: 23000, flightResv: 1400 },
        { name: "3월", travelViews: 34000, accViews: 22500, flightResv: 1350 },
        { name: "4월", travelViews: 41000, accViews: 26000, flightResv: 1600 },
        { name: "5월", travelViews: 44000, accViews: 28000, flightResv: 1800 },
    ],
    paymentShare: [
        { method: "카드", value: 52 },
        { method: "카카오페이", value: 24 },
        { method: "네이버페이", value: 14 },
        { method: "계좌이체", value: 10 },
    ],
};

export const MOCK_RANKINGS = {
    travels: [
        { rank: 1, title: "제주 성산일출봉", region: "제주", score: 4210, mom: "+8%" },
        { rank: 2, title: "속초 설악산", region: "강원", score: 3920, mom: "+5%" },
        { rank: 3, title: "강릉 안목해변", region: "강원", score: 3510, mom: "+3%" },
        { rank: 4, title: "경주 불국사", region: "경북", score: 3300, mom: "+2%" },
        { rank: 5, title: "여수 낭만포차", region: "전남", score: 3250, mom: "+4%" },
    ],
    accommodations: [
        { rank: 1, name: "롯데시티호텔 제주", city: "제주", reservations: 380, rating: 4.9 },
        { rank: 2, name: "강릉 씨마크 호텔", city: "강릉", reservations: 310, rating: 4.8 },
        { rank: 3, name: "부산 파라다이스 호텔", city: "부산", reservations: 290, rating: 4.7 },
        { rank: 4, name: "여수 히든베이", city: "여수", reservations: 240, rating: 4.6 },
        { rank: 5, name: "속초 켄싱턴", city: "속초", reservations: 210, rating: 4.5 },
    ],
};