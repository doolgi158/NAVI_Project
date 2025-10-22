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

            // 병합 시 각 데이터 구조 맞게 키 이름 통일
            const merged = {
                users: responses[0]?.data?.data?.users ?? responses[0]?.data?.data,
                userTrend: responses[0]?.data?.data?.userTrend ?? [],
                travels: responses[1]?.data?.data,
                ranking: responses[2]?.data?.data,
                flights: responses[3].data.data,
                accommodations: {
                    count:
                        responses[4]?.data?.data?.count ??
                        responses[4]?.data?.data ?? // 숫자만 오는 경우
                        0,
                },
            };

            setData(merged);
        } catch (err) {
            console.error("대시보드 데이터 로드 실패:", err);
            setError(err.message || "데이터 요청 실패");
        } finally {
            setLoading(false);
        }
    }, []);

    // 최초 실행
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, reload: fetchData };
};