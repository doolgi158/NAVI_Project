import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * ✅ Admin 대시보드용 데이터 훅 (여러 엔드포인트 병렬 호출)
 * @param {string[]} endpoints 백엔드 API 경로 배열
 * @returns {object} { data, loading, error, reload }
 */
export const useDashboardData = (endpoints) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!endpoints || endpoints.length === 0) return;

        try {
            setLoading(true);
            setError(null);

            const responses = await Promise.all(
                endpoints.map((url) =>
                    axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    })
                )
            );

            console.log("📦 Dashboard responses:", responses);

            // ✅ 백엔드에서 받은 결제 추세 데이터 (배열)
            const paymentsTrend = responses[8]?.data?.data ?? [];

            // ✅ 가장 최신 달 데이터 (마지막 인덱스)
            const latestPayment =
                paymentsTrend.length > 0
                    ? paymentsTrend[paymentsTrend.length - 1]
                    : null;

            // ✅ 전체 데이터 병합
            const merged = {
                users: responses[0]?.data?.data?.users ?? responses[0]?.data?.data,
                userTrend: responses[7]?.data?.data ?? [],
                travels: responses[1]?.data?.data,
                ranking: responses[2]?.data?.data,
                flights: responses[3]?.data?.data,
                accommodations: {
                    count:
                        responses[4]?.data?.data?.count ??
                        responses[4]?.data?.data ??
                        0,
                },
                accommodationRanking: responses[5]?.data?.data ?? [],
                usageTrend: responses[6]?.data?.data?.usageTrend ?? [],

                // ✅ 결제/환불 데이터
                paymentsTrend,
                payments: latestPayment
                    ? {
                        month: latestPayment.month ?? "",
                        paymentCount: latestPayment.paymentCount ?? 0,
                        refundCount: latestPayment.refundCount ?? 0,
                        salesAmount: latestPayment.salesAmount ?? 0,
                        refundAmount: latestPayment.refundAmount ?? 0,
                        changedPct: latestPayment.changedPct ?? 0,
                    }
                    : {
                        month: "",
                        paymentCount: 0,
                        refundCount: 0,
                        salesAmount: 0,
                        refundAmount: 0,
                        changedPct: 0,
                    },
                paymentShare: responses[9]?.data?.data ?? [],
            };

            setData(merged);
        } catch (err) {
            console.error("❌ 대시보드 데이터 로드 실패:", err);
            setError(err.message || "데이터 요청 실패");
        } finally {
            setLoading(false);
        }
    }, [endpoints]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, reload: fetchData };
};